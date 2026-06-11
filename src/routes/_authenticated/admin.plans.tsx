import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { Save, Plus, Trash2, X, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/plans")({
  component: AdminPlans,
});

type Service = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  description_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  price_usd: number;
  state_fee_usd: number | null;
  price_mad: number | null;
  original_price_mad: number | null;
  delivery_days: number | null;
  badge_key: string | null;
  group_key: string | null;
  us_state: string | null;
  tier: string | null;
  features: { k: string }[] | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const GROUPS = ["wyoming", "montana", "new_mexico"];
const TIERS = ["basic", "ultimate", "ultimate_launch"];
const BADGES = ["", "most_requested", "recommended", "best_value"];

function AdminPlans() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("group_key", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Service[];
    },
  });

  const save = useMutation({
    mutationFn: async (s: Service) => {
      const { id, ...rest } = s;
      const payload = {
        ...rest,
        price_usd: Number(rest.price_usd) || 0,
        state_fee_usd: rest.state_fee_usd == null ? 0 : Number(rest.state_fee_usd),
        price_mad: rest.price_mad == null ? null : Number(rest.price_mad),
        original_price_mad: rest.original_price_mad == null ? null : Number(rest.original_price_mad),
        delivery_days: rest.delivery_days == null ? null : Number(rest.delivery_days),
        sort_order: rest.sort_order == null ? 0 : Number(rest.sort_order),
        badge_key: rest.badge_key || null,
      };
      const { error } = await supabase.from("services").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["llc-packages"] });
      setEditing(null);
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const slug = `new-plan-${Date.now()}`;
      const { data, error } = await supabase
        .from("services")
        .insert({
          slug,
          name_en: "New plan",
          price_usd: 0,
          is_active: false,
          group_key: "wyoming",
          tier: "basic",
          sort_order: 99,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Service;
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      setEditing(s);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plans"] }),
  });

  const filtered = useMemo(() => {
    const all = data ?? [];
    if (filter === "all") return all;
    if (filter === "other") return all.filter((s) => !s.group_key);
    return all.filter((s) => s.group_key === filter);
  }, [data, filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("admin.plans.title")}</h1>
          <p className="mt-1 text-sm text-text-2">{t("admin.plans.subtitle")}</p>
        </div>
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-elegant disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {t("admin.plans.new")}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {["all", ...GROUPS, "other"].map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              filter === g ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-2 hover:bg-accent"
            }`}
          >
            {g === "all" ? t("admin.plans.filter.all") : g === "other" ? t("admin.plans.filter.other") : g.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-text-3">{t("common.loading")}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-accent/40 text-xs uppercase tracking-wider text-text-3">
              <tr>
                <th className="p-3 text-start">{t("admin.plans.col.name")}</th>
                <th className="p-3 text-start">{t("admin.plans.col.group")}</th>
                <th className="p-3 text-start">{t("admin.plans.col.tier")}</th>
                <th className="p-3 text-end">{t("admin.plans.col.price_mad")}</th>
                <th className="p-3 text-end">{t("admin.plans.col.price_usd")}</th>
                <th className="p-3 text-center">{t("admin.plans.col.active")}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-accent/30">
                  <td className="p-3">
                    <div className="font-semibold">{s.name_en}</div>
                    <div className="text-xs text-text-3">{s.slug}</div>
                  </td>
                  <td className="p-3 text-text-2">{s.group_key ?? "—"}</td>
                  <td className="p-3 text-text-2">{s.tier ?? "—"}</td>
                  <td className="p-3 text-end font-mono">{s.price_mad ?? "—"}</td>
                  <td className="p-3 text-end font-mono">${Number(s.price_usd ?? 0).toFixed(0)}</td>
                  <td className="p-3 text-center">
                    {s.is_active ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-text-3" />}
                  </td>
                  <td className="p-3 text-end">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(s)}
                        className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t("admin.plans.confirm_delete"))) remove.mutate(s.id);
                        }}
                        className="rounded-md bg-rose-500/10 p-1.5 text-rose-600 hover:bg-rose-500/20"
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-text-3">{t("admin.plans.empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditDrawer
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => save.mutate(p)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function EditDrawer({
  plan,
  onClose,
  onSave,
  saving,
}: {
  plan: Service;
  onClose: () => void;
  onSave: (p: Service) => void;
  saving: boolean;
}) {
  const { t } = useLang();
  const [form, setForm] = useState<Service>(plan);
  const featuresText = (form.features ?? []).map((f) => f.k).join("\n");

  const update = <K extends keyof Service>(k: K, v: Service[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-background p-6 shadow-dramatic"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{t("admin.plans.edit_title")}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-6 space-y-5">
          <Field label={t("admin.plans.slug")}>
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputCls} />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("admin.plans.name_en")}><input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} className={inputCls} /></Field>
            <Field label={t("admin.plans.name_fr")}><input value={form.name_fr ?? ""} onChange={(e) => update("name_fr", e.target.value)} className={inputCls} /></Field>
            <Field label={t("admin.plans.name_ar")}><input value={form.name_ar ?? ""} onChange={(e) => update("name_ar", e.target.value)} className={inputCls} dir="rtl" /></Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("admin.plans.desc_en")}><textarea value={form.description_en ?? ""} onChange={(e) => update("description_en", e.target.value)} className={inputCls} rows={3} /></Field>
            <Field label={t("admin.plans.desc_fr")}><textarea value={form.description_fr ?? ""} onChange={(e) => update("description_fr", e.target.value)} className={inputCls} rows={3} /></Field>
            <Field label={t("admin.plans.desc_ar")}><textarea value={form.description_ar ?? ""} onChange={(e) => update("description_ar", e.target.value)} className={inputCls} rows={3} dir="rtl" /></Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("admin.plans.group")}>
              <select value={form.group_key ?? ""} onChange={(e) => update("group_key", e.target.value || null)} className={inputCls}>
                <option value="">{t("common.none")}</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={t("admin.plans.tier")}>
              <select value={form.tier ?? ""} onChange={(e) => update("tier", e.target.value || null)} className={inputCls}>
                <option value="">{t("common.none")}</option>
                {TIERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("admin.plans.price_mad")}>
              <input type="number" value={form.price_mad ?? ""} onChange={(e) => update("price_mad", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label={t("admin.plans.original_mad")}>
              <input type="number" value={form.original_price_mad ?? ""} onChange={(e) => update("original_price_mad", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label={t("admin.plans.price_usd")}>
              <input type="number" step="0.01" value={form.price_usd ?? 0} onChange={(e) => update("price_usd", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label={t("admin.plans.state_fee")}>
              <input type="number" step="0.01" value={form.state_fee_usd ?? 0} onChange={(e) => update("state_fee_usd", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("admin.plans.delivery")}>
              <input type="number" value={form.delivery_days ?? ""} onChange={(e) => update("delivery_days", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label={t("admin.plans.badge")}>
              <select value={form.badge_key ?? ""} onChange={(e) => update("badge_key", e.target.value || null)} className={inputCls}>
                {BADGES.map((b) => <option key={b} value={b}>{b || t("common.none")}</option>)}
              </select>
            </Field>
            <Field label={t("admin.plans.sort")}>
              <input type="number" value={form.sort_order ?? 0} onChange={(e) => update("sort_order", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>

          <Field label={t("admin.plans.features")}>
            <textarea
              value={featuresText}
              onChange={(e) =>
                update(
                  "features",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((k) => ({ k })),
                )
              }
              className={inputCls}
              rows={8}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
            {t("admin.plans.is_active")}
          </label>
        </div>

        <footer className="sticky bottom-0 mt-8 flex justify-end gap-3 border-t border-border bg-background py-4">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
            {t("common.cancel")}
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:shadow-elegant disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? t("common.saving") : t("common.save")}
          </button>
        </footer>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-3">{label}</span>
      {children}
    </label>
  );
}
