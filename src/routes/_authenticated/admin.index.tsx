import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Users,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Newspaper,
  Settings as SettingsIcon,
  Plus,
  ArrowRight,
  DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  in_progress: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  filed: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  ein_received: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  banking_done: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
  pending_payment: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

function AdminDashboard() {
  const { t } = useLang();
  const { data } = useQuery({
    queryKey: ["admin-home"],
    queryFn: async () => {
      const [clients, orders, docs, posts, services] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, order_number, business_name, status, total_usd, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("documents").select("id, status").eq("status", "pending"),
        supabase
          .from("blog_posts")
          .select("id, slug, title_en, status, published_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase.from("services").select("id, created_at", { count: "exact" }).eq("is_active", true),
      ]);

      const active = (orders.data ?? []).filter(
        (o: { status: string }) => !["completed", "pending_payment"].includes(o.status),
      ).length;
      const revenue = (orders.data ?? []).reduce(
        (s: number, o: { total_usd: number | null }) => s + Number(o.total_usd ?? 0),
        0,
      );
      const queue = (orders.data ?? [])
        .filter((o: { status: string }) => !["completed"].includes(o.status))
        .slice(0, 5);
      const allPosts = posts.data ?? [];
      const published = allPosts.filter((p: { status: string }) => p.status === "published");
      const drafts = allPosts.filter((p: { status: string }) => p.status === "draft");
      const lastServiceUpdate = (services.data ?? []).reduce(
        (max: string, s: { created_at: string }) => (s.created_at > max ? s.created_at : max),
        "",
      );

      return {
        clients: clients.count ?? 0,
        revenue,
        active,
        pendingDocs: docs.data?.length ?? 0,
        queue,
        publishedCount: published.length,
        draftCount: drafts.length,
        recentPublished: published.slice(0, 3),
        servicesCount: services.count ?? 0,
        lastServiceUpdate,
      };
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.home.title")}</h1>
        <p className="mt-1 text-sm text-text-2">{t("admin.home.subtitle")}</p>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label={t("admin.kpi.clients")} value={data?.clients ?? 0} />
        <Kpi label={t("admin.kpi.revenue")} value={`$${Number(data?.revenue ?? 0).toLocaleString()}`} />
        <Kpi label={t("admin.kpi.active_orders")} value={data?.active ?? 0} />
        <Kpi label={t("admin.kpi.docs_pending")} value={data?.pendingDocs ?? 0} />
      </div>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-text-3">{t("admin.quick_actions")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink to="/admin/blog/new" icon={Plus} label={t("admin.q.new_post")} hint={t("admin.q.new_post_hint")} />
          <QuickLink to="/admin/blog" icon={Newspaper} label={t("admin.q.manage_blog")} hint={t("admin.q.manage_blog_hint")} />
          <QuickLink to="/admin/settings" icon={SettingsIcon} label={t("admin.q.pricing")} hint={t("admin.q.pricing_hint")} />
          <QuickLink to="/admin/orders" icon={ClipboardList} label={t("admin.q.orders_queue")} hint={t("admin.q.orders_queue_hint")} />
          <QuickLink to="/admin/documents" icon={FileCheck} label={t("admin.q.docs_review")} hint={t("admin.q.docs_review_hint")} />
          <QuickLink to="/admin/messages" icon={MessageSquare} label={t("admin.q.messages_inbox")} hint={t("admin.q.messages_inbox_hint")} />
        </div>
      </section>

      {/* Two-column: blog + currency */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Blog summary */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{t("admin.blog.section")}</h3>
            </div>
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:shadow-elegant"
            >
              <Plus className="h-3 w-3" /> {t("admin.blog.new")}
            </Link>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <Pill label={t("admin.blog.published")} value={data?.publishedCount ?? 0} tone="emerald" />
            <Pill label={t("admin.blog.drafts")} value={data?.draftCount ?? 0} tone="slate" />
          </div>
          <ul className="mt-5 space-y-2">
            {(data?.recentPublished ?? []).length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-text-3">
                {t("admin.blog.nothing_published")}
              </li>
            )}
            {(data?.recentPublished ?? []).map((p: { id: string; slug: string; title_en: string; published_at: string | null }) => (
              <li key={p.id}>
                <Link
                  to="/admin/blog/$postId"
                  params={{ postId: p.id }}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-accent"
                >
                  <span className="truncate font-medium">{p.title_en || p.slug}</span>
                  <span className="ms-3 shrink-0 text-[11px] text-text-3">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Pricing & currency */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{t("admin.pricing.section")}</h3>
            </div>
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {t("admin.pricing.settings")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-text-3">{t("admin.pricing.base")}</dt>
              <dd className="mt-1 font-bold">USD</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-text-3">{t("admin.pricing.active_services")}</dt>
              <dd className="mt-1 font-bold">{data?.servicesCount ?? 0}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[11px] uppercase tracking-wider text-text-3">{t("admin.pricing.last_update")}</dt>
              <dd className="mt-1 font-medium text-text-2">
                {data?.lastServiceUpdate ? new Date(data.lastServiceUpdate).toLocaleString() : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-text-3">
            {t("admin.pricing.fx_note")}
          </p>
        </Card>
      </div>

      {/* Next steps queue */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-text-3">{t("admin.next_steps")}</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
            {t("admin.all_orders")} →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {(data?.queue ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-text-3">{t("admin.no_active_orders")}</div>
          ) : (
            <ul className="divide-y divide-border">
              {(data?.queue ?? []).map(
                (o: { id: string; order_number: string | null; business_name: string | null; status: string; total_usd: number | null }) => (
                  <li key={o.id}>
                    <Link
                      to="/admin/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-accent/40"
                    >
                      <Users className="h-4 w-4 shrink-0 text-text-3" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{o.business_name || "—"}</div>
                        <div className="text-xs text-text-3">{o.order_number ?? "—"}</div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_COLOR[o.status] ?? "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                      <span className="hidden w-20 text-end text-xs font-semibold text-text-2 sm:block" dir="ltr">
                        ${Number(o.total_usd ?? 0).toLocaleString()}
                      </span>
                      <ArrowRight className="h-3 w-3 text-text-3" />
                    </Link>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-text-3">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-primary">{value}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5">{children}</div>;
}

function QuickLink({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-xs text-text-3">{hint}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-text-3 transition-transform group-hover:translate-x-1 rtl-flip" />
    </Link>
  );
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "emerald" | "slate" }) {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  return (
    <div>
      <div className={`inline-flex items-baseline gap-2 rounded-full px-3 py-1 text-xs font-bold ${toneCls}`}>
        <span>{value}</span>
        <span className="opacity-80">{label}</span>
      </div>
    </div>
  );
}
