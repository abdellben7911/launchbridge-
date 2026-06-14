import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Phone, Mail, MessageCircle, ExternalLink, Users, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: AdminClients,
});

type ClientRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  created_at: string;
  orders: { id: string; status: string; business_name: string | null; order_number: string | null }[];
};

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  paid: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  ein_filed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  ein_received: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  banking: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

function AdminClients() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async (): Promise<ClientRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, full_name, email, phone, whatsapp, country, created_at,
          orders (id, status, business_name, order_number)`)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as ClientRow[];
    },
  });

  const countries = [...new Set(data.map((c) => c.country).filter(Boolean))] as string[];

  const filtered = data.filter((c) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      (c.full_name ?? "").toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      (c.whatsapp ?? "").includes(s) ||
      (c.phone ?? "").includes(s) ||
      c.orders.some((o) => (o.business_name ?? "").toLowerCase().includes(s));
    const matchCountry = countryFilter === "all" || c.country === countryFilter;
    return matchSearch && matchCountry;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-text-2">
            {data.length} registered · {data.filter((c) => c.orders.length > 0).length} with orders
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, business…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid h-32 place-items-center text-sm text-text-3">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="grid h-32 place-items-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center gap-2 text-text-3">
            <Users className="h-8 w-8 opacity-40" />
            <span className="text-sm">No clients found</span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-2/60">
                {["Client", "Contact", "Country", "Orders", "Joined", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((client) => {
                const waPhone = (client.whatsapp ?? client.phone ?? "").replace(/\D/g, "");
                const latestOrder = client.orders[0];
                return (
                  <tr key={client.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(client.full_name ?? client.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{client.full_name ?? "—"}</div>
                          <div className="text-xs text-text-3">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {waPhone && (
                          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer"
                            className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400" title={client.whatsapp ?? ""}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {client.phone && (
                          <a href={`tel:${client.phone}`}
                            className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-400" title={client.phone}>
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a href={`mailto:${client.email}`}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-400" title={client.email}>
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-2">{client.country ?? "—"}</td>
                    <td className="px-4 py-3">
                      {client.orders.length === 0 ? (
                        <span className="text-xs text-text-3">No orders</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {client.orders.slice(0, 2).map((o) => (
                            <Link key={o.id} to="/admin/orders/$orderId" params={{ orderId: o.id }}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[o.status] ?? "bg-accent text-text-2"}`}>
                              {o.order_number ?? o.id.slice(0, 6)}
                              {o.business_name && ` · ${o.business_name}`}
                            </Link>
                          ))}
                          {client.orders.length > 2 && <span className="text-xs text-text-3">+{client.orders.length - 2}</span>}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-text-3">
                      {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/admin/clients/$clientId"
                          params={{ clientId: client.id }}
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                        >
                          <Settings2 className="h-3 w-3" /> Manage
                        </Link>
                        {latestOrder && (
                          <Link to="/admin/orders/$orderId" params={{ orderId: latestOrder.id }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-text-2 hover:text-primary">
                            Order <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
