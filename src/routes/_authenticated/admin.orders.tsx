import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";

type Row = {
  id: string;
  order_number: string | null;
  status: string;
  payment_status: string | null;
  business_name: string | null;
  total_usd: number | null;
  preferred_channel: string | null;
  created_at: string;
  client_id: string;
  profiles: { full_name: string | null; email: string; whatsapp: string | null } | null;
};

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { t } = useLang();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("id, order_number, status, payment_status, business_name, total_usd, preferred_channel, created_at, client_id, profiles:client_id(full_name, email, whatsapp)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const filtered = data.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (r.order_number ?? "").toLowerCase().includes(s) ||
      (r.business_name ?? "").toLowerCase().includes(s) ||
      (r.profiles?.full_name ?? "").toLowerCase().includes(s) ||
      (r.profiles?.email ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{t("admin.orders.title")}</h1>
          <p className="text-sm text-text-2">{t("admin.orders.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.orders.search_ph")}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">{t("admin.orders.all_statuses")}</option>
            <option value="pending_payment">{t("admin.orders.status.pending_payment")}</option>
            <option value="paid">{t("admin.orders.status.paid")}</option>
            <option value="in_progress">{t("admin.orders.status.in_progress")}</option>
            <option value="ein_filed">{t("admin.orders.status.ein_filed")}</option>
            <option value="ein_received">{t("admin.orders.status.ein_received")}</option>
            <option value="banking">{t("admin.orders.status.banking")}</option>
            <option value="completed">{t("admin.orders.status.completed")}</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-2 text-left text-[11px] uppercase tracking-wider text-text-3">
            <tr>
              <th className="px-4 py-3">{t("admin.orders.col.order")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.client")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.business")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.status")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.payment")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.channel")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.total")}</th>
              <th className="px-4 py-3">{t("admin.orders.col.created")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-text-3">{t("common.loading")}</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-text-3">{t("admin.orders.empty")}</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link to="/admin/orders/$orderId" params={{ orderId: r.id }} className="text-primary hover:underline">
                    {r.order_number ?? r.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{r.profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-text-3">{r.profiles?.email}</div>
                </td>
                <td className="px-4 py-3">{r.business_name ?? "—"}</td>
                <td className="px-4 py-3"><Pill text={r.status} /></td>
                <td className="px-4 py-3"><Pill text={r.payment_status ?? "—"} tone={r.payment_status === "paid" ? "green" : "amber"} /></td>
                <td className="px-4 py-3 capitalize">{r.preferred_channel ?? "—"}</td>
                <td className="px-4 py-3">${Number(r.total_usd ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-text-3">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pill({ text, tone = "slate" }: { text: string; tone?: "green" | "amber" | "slate" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : tone === "amber"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{text}</span>;
}
