import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, User, FileText, CreditCard, Globe, Phone,
  Upload, Download, Trash2, Loader2, Check, X, CheckCircle2,
  Mail, MessageCircle, Building2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/clients/$clientId")({
  component: AdminClientProfile,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string; full_name: string | null; email: string;
  phone: string | null; whatsapp: string | null; country: string | null;
  flag_emoji: string | null; language: string | null; created_at: string;
};

type Order = {
  id: string; order_number: string | null; business_name: string | null;
  business_type: string | null; us_state: string | null; status: string;
  payment_status: string | null; total_usd: number | null;
  submitted_at: string | null; filed_at: string | null;
  ein_received_at: string | null; banking_done_at: string | null;
  completed_at: string | null; intake: Record<string, unknown> | null;
  created_at: string;
};

type Doc = {
  id: string; name: string; type: string; direction: string;
  status: string; file_path: string | null; created_at: string;
  file_size: number | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["pending_payment","paid","in_progress","ein_filed","ein_received","banking","completed"];
const PAYMENT_STATUSES = ["unpaid","link_sent","paid","refunded"];
const GW_STATUSES = ["not_included","pending","pending_review","action_required","active","completed"];
const ALL_GATEWAYS = ["stripe","shopify","wise","payoneer","paypal","airwallex","mercury","relay","etsy","ebay"] as const;
const DOC_TYPES = ["formation","ein_letter","operating_agreement","id_front","id_back","proof_address","other"];
const DOC_TYPE_LABEL: Record<string,string> = {
  formation: "Articles of Organization", ein_letter: "EIN / CP-575 Letter",
  operating_agreement: "Operating Agreement", id_front: "ID — Front",
  id_back: "ID — Back", proof_address: "Proof of Address", other: "Other",
};
const STATUS_STYLE: Record<string,{bg:string;text:string}> = {
  pending_payment: { bg:"bg-slate-100 dark:bg-slate-700/40", text:"text-slate-600 dark:text-slate-300" },
  paid:            { bg:"bg-sky-100 dark:bg-sky-700/40",     text:"text-sky-700 dark:text-sky-300" },
  in_progress:     { bg:"bg-violet-100 dark:bg-violet-700/40",text:"text-violet-700 dark:text-violet-300"},
  ein_filed:       { bg:"bg-amber-100 dark:bg-amber-700/40", text:"text-amber-700 dark:text-amber-300" },
  ein_received:    { bg:"bg-fuchsia-100 dark:bg-fuchsia-700/40",text:"text-fuchsia-700 dark:text-fuchsia-300"},
  banking:         { bg:"bg-indigo-100 dark:bg-indigo-700/40",text:"text-indigo-700 dark:text-indigo-300"},
  completed:       { bg:"bg-emerald-100 dark:bg-emerald-700/40",text:"text-emerald-700 dark:text-emerald-300"},
};
const GW_STYLE: Record<string,string> = {
  not_included: "bg-border/60 text-text-3",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  pending_review: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  action_required: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  active: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

// ─── Main component ───────────────────────────────────────────────────────────

function AdminClientProfile() {
  const { clientId } = Route.useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview"|"documents"|"gateways"|"services">("overview");

  // ── Queries ──
  const profileQ = useQuery({
    queryKey: ["admin-client-profile", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", clientId).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const ordersQ = useQuery({
    queryKey: ["admin-client-orders", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,business_name,business_type,us_state,status,payment_status,total_usd,submitted_at,filed_at,ein_received_at,banking_done_at,completed_at,intake,created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

  const docsQ = useQuery({
    queryKey: ["admin-client-docs", clientId],
    enabled: ordersQ.data != null && ordersQ.data.length > 0,
    queryFn: async () => {
      const orderIds = (ordersQ.data ?? []).map((o) => o.id);
      if (!orderIds.length) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("id,name,type,direction,status,file_path,created_at,file_size")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Doc[];
    },
  });

  if (profileQ.isLoading) {
    return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  const profile = profileQ.data;
  if (!profile) return <div className="p-8 text-text-3">Client not found.</div>;

  const latestOrder = ordersQ.data?.[0] ?? null;
  const initials = (profile.full_name ?? profile.email).split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase();
  const waPhone = (profile.whatsapp ?? profile.phone ?? "").replace(/\D/g,"");

  const TABS = [
    { id:"overview",  label:"Overview",  icon:User },
    { id:"documents", label:"Documents", icon:FileText },
    { id:"gateways",  label:"Gateways",  icon:CreditCard },
    { id:"services",  label:"Services",  icon:Globe },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/admin/clients" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> All clients
      </Link>

      {/* Header card */}
      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-foreground">{profile.full_name ?? "—"}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-2">
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile.email}</span>
            {profile.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>}
            {profile.country && <span>{profile.flag_emoji} {profile.country}</span>}
          </div>
          {latestOrder && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 text-text-3" />
              <span className="font-semibold text-foreground">{latestOrder.business_name ?? "—"}</span>
              <span className="text-text-3">{latestOrder.us_state}</span>
              {(() => { const s = STATUS_STYLE[latestOrder.status]; return s ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.bg} ${s.text}`}>
                  {latestOrder.status.replace(/_/g," ")}
                </span>
              ) : null; })()}
            </div>
          )}
        </div>
        {/* Quick contact */}
        <div className="flex gap-2 shrink-0">
          {waPhone && (
            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          )}
          <a href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-text-2 hover:bg-accent">
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "text-text-2 hover:bg-accent"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab profile={profile} orders={ordersQ.data ?? []} />}
      {tab === "documents" && <DocumentsTab orders={ordersQ.data ?? []} docs={docsQ.data ?? []} clientId={clientId} onRefresh={() => qc.invalidateQueries({ queryKey: ["admin-client-docs", clientId] })} />}
      {tab === "gateways"  && <GatewaysTab orders={ordersQ.data ?? []} onRefresh={() => qc.invalidateQueries({ queryKey: ["admin-client-orders", clientId] })} />}
      {tab === "services"  && <ServicesTab orders={ordersQ.data ?? []} onRefresh={() => qc.invalidateQueries({ queryKey: ["admin-client-orders", clientId] })} />}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ profile, orders }: { profile: Profile; orders: Order[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Client profile">
        <KV k="Full name" v={profile.full_name} />
        <KV k="Email" v={profile.email} />
        <KV k="Phone" v={profile.phone} />
        <KV k="WhatsApp" v={profile.whatsapp} />
        <KV k="Country" v={profile.flag_emoji ? `${profile.flag_emoji} ${profile.country}` : profile.country} />
        <KV k="Language" v={profile.language?.toUpperCase()} />
        <KV k="Joined" v={new Date(profile.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} />
      </Card>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card title="Orders">
            <p className="text-sm text-text-3">No orders placed yet.</p>
          </Card>
        ) : orders.map((o) => (
          <Card key={o.id} title={`Order · ${o.order_number ?? o.id.slice(0,8)}`}>
            <KV k="Company" v={o.business_name} />
            <KV k="Type" v={`${o.business_type ?? "—"} · ${o.us_state ?? "—"}`} />
            <KV k="Status" v={o.status.replace(/_/g," ")} />
            <KV k="Payment" v={o.payment_status ?? "—"} />
            <KV k="Total" v={o.total_usd != null ? `$${Number(o.total_usd).toLocaleString()}` : "—"} />
            <div className="mt-3 pt-3 border-t border-border">
              <Link to="/admin/orders/$orderId" params={{ orderId: o.id }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Open order detail →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({ orders, docs, clientId, onRefresh }: {
  orders: Order[]; docs: Doc[]; clientId: string; onRefresh: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string|null>(null);
  const [docType, setDocType] = useState("formation");
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrderId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `orders/${selectedOrderId}/${docType}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) throw upErr;

      const u = await supabase.auth.getUser();
      const { error: dbErr } = await supabase.from("documents").insert({
        order_id: selectedOrderId,
        name: file.name,
        type: docType,
        direction: "launchbridge",
        status: "approved",
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: u.data.user?.id,
      });
      if (dbErr) throw dbErr;
      toast.success("Document uploaded for client");
      onRefresh();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Doc) => {
    if (!doc.file_path) return;
    setDownloading(doc.id);
    try {
      const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 180);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    } finally {
      setDownloading(null);
    }
  };

  const deleteMut = useMutation({
    mutationFn: async (doc: Doc) => {
      if (doc.file_path) await supabase.storage.from("documents").remove([doc.file_path]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Document deleted"); onRefresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const lbDocs = docs.filter((d) => d.direction === "launchbridge");
  const clientDocs = docs.filter((d) => d.direction !== "launchbridge");

  return (
    <div className="space-y-6">
      {/* Upload panel */}
      <Card title="Upload document for client">
        {orders.length === 0 ? (
          <p className="text-sm text-text-3">Client has no order yet — documents are linked to an order.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Order</label>
                <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number ?? o.id.slice(0,8)} — {o.business_name ?? "—"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Document type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{DOC_TYPE_LABEL[t]}</option>)}
                </select>
              </div>
            </div>

            <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary hover:bg-primary/5 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              <input ref={fileRef} type="file" className="sr-only" onChange={handleUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              {uploading
                ? <Loader2 className="h-7 w-7 animate-spin text-primary" />
                : <Upload className="h-7 w-7 text-text-3" />}
              <span className="text-sm font-semibold text-foreground">
                {uploading ? "Uploading…" : "Click to upload or drag & drop"}
              </span>
              <span className="text-xs text-text-3">PDF, JPG, PNG, DOCX · max 20 MB</span>
            </label>
          </div>
        )}
      </Card>

      {/* Documents sent to client */}
      <Card title={`Sent to client (${lbDocs.length})`}>
        {lbDocs.length === 0 ? (
          <p className="text-sm text-text-3">No documents uploaded for this client yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {lbDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc}
                onDownload={() => handleDownload(doc)}
                onDelete={() => { if (confirm("Delete this document?")) deleteMut.mutate(doc); }}
                downloading={downloading === doc.id} />
            ))}
          </ul>
        )}
      </Card>

      {/* Documents from client */}
      {clientDocs.length > 0 && (
        <Card title={`Submitted by client (${clientDocs.length})`}>
          <ul className="divide-y divide-border">
            {clientDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc}
                onDownload={() => handleDownload(doc)}
                onDelete={() => { if (confirm("Delete?")) deleteMut.mutate(doc); }}
                downloading={downloading === doc.id}
                showApprove />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function DocRow({ doc, onDownload, onDelete, downloading, showApprove }: {
  doc: Doc; onDownload: () => void; onDelete: () => void;
  downloading: boolean; showApprove?: boolean;
}) {
  const qc = useQueryClient();
  const approveMut = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("documents").update({ status }).eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const STATUS_CLS: Record<string,string> = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  };

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground text-sm">{DOC_TYPE_LABEL[doc.type] ?? doc.name}</p>
        <p className="text-xs text-text-3">
          {doc.name}
          {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
          {" · "}{new Date(doc.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_CLS[doc.status] ?? "bg-border/60 text-text-3"}`}>
          {doc.status}
        </span>
        {showApprove && doc.status === "pending" && (
          <>
            <button onClick={() => approveMut.mutate("approved")}
              className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              title="Approve"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => approveMut.mutate("rejected")}
              className="grid h-7 w-7 place-items-center rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
              title="Reject"><X className="h-3.5 w-3.5" /></button>
          </>
        )}
        {doc.file_path && (
          <button onClick={onDownload} disabled={downloading}
            className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-accent"
            title="Download">
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          </button>
        )}
        <button onClick={onDelete}
          className="grid h-7 w-7 place-items-center rounded-lg border border-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </li>
  );
}

// ─── Gateways Tab ─────────────────────────────────────────────────────────────

function GatewaysTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const order = orders[0];
  if (!order) return <Card title="Gateways"><p className="text-sm text-text-3">No order found for this client.</p></Card>;

  const intake = (order.intake ?? {}) as Record<string,unknown>;
  const services = (intake.services ?? {}) as Record<string,unknown>;
  const gwData = (services.gateways ?? {}) as Record<string,{status?:string;note?:string}>;
  const includedGWs = ((intake.addons as Record<string,unknown>)?.gateways ?? []) as string[];

  const updateGateway = async (gw: string, status: string) => {
    const newGwData = { ...gwData, [gw]: { ...(gwData[gw] ?? {}), status } };
    const newIntake = { ...intake, services: { ...(services), gateways: newGwData } };
    const { error } = await supabase.from("orders").update({ intake: newIntake }).eq("id", order.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${gw} → ${status}`);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <Card title="Payment gateway statuses">
        <p className="mb-4 text-xs text-text-3">
          Included in package: <span className="font-semibold text-foreground">{includedGWs.join(", ") || "None stored"}</span>.
          Changes here update the client's dashboard in real time.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ALL_GATEWAYS.map((gw) => {
            const current = gwData[gw]?.status ?? (includedGWs.includes(gw) ? "pending" : "not_included");
            return (
              <div key={gw} className="flex items-center gap-3 rounded-xl border border-border bg-bg-2/40 px-4 py-3">
                <div className="w-24 font-semibold text-sm capitalize text-foreground">{gw}</div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold flex-1 text-center ${GW_STYLE[current] ?? "bg-border/60 text-text-3"}`}>
                  {current.replace(/_/g," ")}
                </span>
                <select
                  value={current}
                  onChange={(e) => updateGateway(gw, e.target.value)}
                  className="rounded-lg border border-border bg-card px-2 py-1 text-xs"
                >
                  {GW_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const order = orders[0];
  const intake = (order?.intake ?? {}) as Record<string,unknown>;
  const services = (intake.services ?? {}) as Record<string,unknown>;
  const phone = (services.phone ?? {}) as Record<string,unknown>;
  const website = (services.website ?? {}) as Record<string,unknown>;

  const [phoneNumber, setPhoneNumber] = useState(String(phone.number ?? ""));
  const [loginEmail, setLoginEmail] = useState(String(phone.login_email ?? ""));
  const [phoneStatus, setPhoneStatus] = useState(String(phone.status ?? "pending"));
  const [domain, setDomain] = useState(String(website.domain ?? ""));
  const [websiteProgress, setWebsiteProgress] = useState(Number(website.progress ?? 0));
  const [websiteStatus, setWebsiteStatus] = useState(String(website.status ?? "pending"));
  const [saving, setSaving] = useState(false);

  // Order dates
  const [submittedAt, setSubmittedAt] = useState(order?.submitted_at?.slice(0,10) ?? "");
  const [filedAt, setFiledAt] = useState(order?.filed_at?.slice(0,10) ?? "");
  const [einReceivedAt, setEinReceivedAt] = useState(order?.ein_received_at?.slice(0,10) ?? "");

  if (!order) return <Card title="Services"><p className="text-sm text-text-3">No order found.</p></Card>;

  const saveServices = async () => {
    setSaving(true);
    try {
      const newIntake = {
        ...intake,
        services: {
          ...services,
          phone: { number: phoneNumber, login_email: loginEmail, status: phoneStatus },
          website: { domain, progress: websiteProgress, status: websiteStatus },
        },
      };
      const patch: Record<string,unknown> = { intake: newIntake };
      if (submittedAt) patch.submitted_at = new Date(submittedAt).toISOString();
      if (filedAt) patch.filed_at = new Date(filedAt).toISOString();
      if (einReceivedAt) patch.ein_received_at = new Date(einReceivedAt).toISOString();

      const { error } = await supabase.from("orders").update(patch).eq("id", order.id);
      if (error) throw error;
      toast.success("Services updated");
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order milestones */}
      <Card title="Formation milestones">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Submitted date">
            <input type="date" value={submittedAt} onChange={(e) => setSubmittedAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Filed at IRS">
            <input type="date" value={filedAt} onChange={(e) => setFiledAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="EIN received">
            <input type="date" value={einReceivedAt} onChange={(e) => setEinReceivedAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
        </div>
      </Card>

      {/* U.S. Phone */}
      <Card title="U.S. Phone service">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Phone number">
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Login email">
            <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="client@openphone.com" className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Status">
            <select value={phoneStatus} onChange={(e) => setPhoneStatus(e.target.value)} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {GW_STATUSES.filter(s => s !== "not_included").map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* Website */}
      <Card title="Website & Domain">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Domain">
            <input value={domain} onChange={(e) => setDomain(e.target.value)}
              placeholder="mybusiness.com" className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Build progress (%)">
            <input type="number" min={0} max={100} value={websiteProgress}
              onChange={(e) => setWebsiteProgress(Number(e.target.value))} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Status">
            <select value={websiteStatus} onChange={(e) => setWebsiteStatus(e.target.value)} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {GW_STATUSES.filter(s => s !== "not_included").map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <button onClick={saveServices} disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Save changes
      </button>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-3">{title}</h2>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-2 text-sm last:border-0">
      <span className="text-text-3">{k}</span>
      <span className="text-right font-medium text-foreground">{v ?? "—"}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-2 mb-1">{label}</label>
      {children}
    </div>
  );
}

// Tailwind class for all inputs (injected via className on JSX)
// declared here to keep components clean
const _inputBase = "w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
void _inputBase;
