import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, MessageCircle, Mail, Phone, Send, Loader2 } from "lucide-react";

const STATUSES = ["pending_payment", "paid", "in_progress", "ein_filed", "ein_received", "banking", "completed"];
const PAY_STATUSES = ["unpaid", "link_sent", "paid", "refunded"];

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const [draftNote, setDraftNote] = useState("");
  const [composer, setComposer] = useState<null | "whatsapp" | "email">(null);
  const [payLink, setPayLink] = useState("");
  const [bankInfo, setBankInfo] = useState("LaunchBridge LLC\nBank: Mercury\nRouting: 084106768\nAccount: 9800123456\nSWIFT: CMFGUS33");

  const orderQ = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles:client_id(full_name, email, phone, whatsapp, country)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const timelineQ = useQuery({
    queryKey: ["admin-order-timeline", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_timeline")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateMut = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("orders").update(patch as any).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-order", orderId] }),
  });

  const addTimelineMut = useMutation({
    mutationFn: async (vars: { status: string; note: string }) => {
      const u = await supabase.auth.getUser();
      const { error } = await supabase.from("order_timeline").insert({
        order_id: orderId,
        status: vars.status,
        note_en: vars.note,
        created_by: u.data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraftNote("");
      qc.invalidateQueries({ queryKey: ["admin-order-timeline", orderId] });
    },
  });

  if (orderQ.isLoading) return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const o = orderQ.data as any;
  if (!o) return <div>Order not found.</div>;

  const intake = (o.intake ?? {}) as any;
  const client = o.profiles ?? {};
  const waPhone = (client.whatsapp ?? intake.contact?.whatsapp ?? "").replace(/\D/g, "");
  const total = Number(o.total_usd ?? 0).toLocaleString();

  const waMessage = encodeURIComponent(
    `Hi ${client.full_name ?? ""}, your LaunchBridge order ${o.order_number ?? ""} is ready for payment.\n\nTotal: $${total} ${o.currency_paid ?? "USD"}\n` +
    (payLink ? `\nPayment link: ${payLink}\n` : "") +
    (bankInfo ? `\nBank details:\n${bankInfo}\n` : "") +
    `\nReply here once paid and we'll move forward immediately.`,
  );
  const emailBody = decodeURIComponent(waMessage);
  const waHref = waPhone ? `https://wa.me/${waPhone}?text=${waMessage}` : "#";
  const mailHref = `mailto:${client.email ?? ""}?subject=${encodeURIComponent(`LaunchBridge order ${o.order_number ?? ""} — payment instructions`)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Order</p>
          <h1 className="text-3xl font-extrabold">{o.order_number ?? o.id.slice(0, 8)}</h1>
          <p className="text-sm text-text-2">{o.business_name} · {o.business_type} · {o.us_state}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-right">
          <div className="text-xs text-text-3">Total</div>
          <div className="text-2xl font-extrabold text-primary">${total}</div>
          <div className="text-[11px] text-text-3">{o.currency_paid}</div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Client + intake summary */}
          <Card title="Client">
            <KV k="Name" v={client.full_name ?? "—"} />
            <KV k="Email" v={client.email} />
            <KV k="WhatsApp" v={client.whatsapp ?? intake.contact?.whatsapp ?? "—"} />
            <KV k="Phone" v={client.phone ?? intake.contact?.phone ?? "—"} />
            <KV k="Country" v={client.country ?? "—"} />
            <KV k="Preferred channel" v={o.preferred_channel ?? "—"} />
            <KV k="Best time" v={o.preferred_contact_time ?? "—"} />
          </Card>

          <Card title="Business intake">
            <KV k="Industry" v={o.industry ?? "—"} />
            <KV k="Description" v={o.business_desc ?? "—"} />
            <KV k="Add-ons" v={
              [
                intake.addons?.us_phone && "U.S. phone",
                intake.addons?.website && "Website",
                intake.addons?.gateways?.length && `Gateways: ${intake.addons.gateways.join(", ")}`,
              ].filter(Boolean).join(" · ") || "—"
            } />
            <KV k="Payment preference" v={`${intake.payment_preference?.currency ?? "—"} · ${intake.payment_preference?.method ?? "—"}`} />
            <KV k="Notes" v={intake.notes ?? "—"} />
          </Card>

          {/* Timeline */}
          <Card title="Timeline">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Append a public timeline note for the client…"
                  className="flex-1 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm"
                />
                <button
                  disabled={!draftNote.trim() || addTimelineMut.isPending}
                  onClick={() => addTimelineMut.mutate({ status: "update", note: draftNote })}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Post
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {(timelineQ.data ?? []).map((t: any) => (
                  <li key={t.id} className="rounded-lg border border-border bg-bg-2 p-3 text-sm">
                    <div className="font-semibold">{t.note_en ?? t.status}</div>
                    <div className="text-[11px] text-text-3">{new Date(t.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Right column: status + payment composer */}
        <div className="space-y-6">
          <Card title="Status">
            <label className="block text-xs font-semibold text-text-2">Workflow</label>
            <select
              value={o.status}
              onChange={(e) => updateMut.mutate({ status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="mt-4 block text-xs font-semibold text-text-2">Payment</label>
            <select
              value={o.payment_status ?? "unpaid"}
              onChange={(e) => updateMut.mutate({ payment_status: e.target.value, paid_at: e.target.value === "paid" ? new Date().toISOString() : null })}
              className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm"
            >
              {PAY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              <button onClick={() => updateMut.mutate({ submitted_at: new Date().toISOString() })} className="rounded-lg border border-border px-2 py-2 hover:bg-accent">Mark submitted</button>
              <button onClick={() => updateMut.mutate({ filed_at: new Date().toISOString() })} className="rounded-lg border border-border px-2 py-2 hover:bg-accent">Mark filed</button>
              <button onClick={() => updateMut.mutate({ ein_received_at: new Date().toISOString() })} className="rounded-lg border border-border px-2 py-2 hover:bg-accent">EIN received</button>
            </div>
          </Card>

          <Card title="Send payment instructions">
            <label className="block text-xs font-semibold text-text-2">Payment link (optional)</label>
            <input value={payLink} onChange={(e) => setPayLink(e.target.value)} placeholder="https://buy.stripe.com/…" className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm" />
            <label className="mt-3 block text-xs font-semibold text-text-2">Bank info</label>
            <textarea value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 font-mono text-xs" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setComposer("whatsapp");
                  addTimelineMut.mutate({ status: "payment_link_sent", note: "Payment instructions sent via WhatsApp." });
                  updateMut.mutate({ payment_status: "link_sent" });
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={mailHref}
                onClick={() => {
                  setComposer("email");
                  addTimelineMut.mutate({ status: "payment_link_sent", note: "Payment instructions sent via email." });
                  updateMut.mutate({ payment_status: "link_sent" });
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            </div>
            {client.phone && (
              <a href={`tel:${client.phone}`} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">
                <Phone className="h-3.5 w-3.5" /> Call {client.phone}
              </a>
            )}
            {composer && <p className="mt-2 text-[11px] text-text-3">Logged to timeline. Mark payment as paid above once received.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
function KV({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-1.5 text-sm last:border-0">
      <span className="text-text-3">{k}</span>
      <span className="text-right font-medium text-foreground">{v ?? "—"}</span>
    </div>
  );
}
