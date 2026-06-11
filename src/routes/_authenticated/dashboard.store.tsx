import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader, Card } from "@/components/dashboard/shared";
import { Store, Plus, Check, Building2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/store")({
  component: StorePage,
});

type Item = {
  id: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  description_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  category: string;
  price_mad: number;
  is_active: boolean;
};

function StorePage() {
  const { user } = useAuth();
  const { activeId } = useActiveWorkspace();
  const { lang } = useLang();
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const q = useQuery({
    queryKey: ["store-items"],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("store_items")
        .select("id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, category, price_mad, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });

  // Formation packages have their own dedicated flow at /dashboard/start.
  // The store is for post-formation add-ons only.
  const items = (q.data ?? []).filter((i) => i.category !== "formation");
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const currentCat = activeCat ?? categories[0] ?? null;

  const nameOf = (i: Item) =>
    (lang === "fr" && i.name_fr) || (lang === "ar" && i.name_ar) || i.name_en;
  const descOf = (i: Item) =>
    (lang === "fr" && i.description_fr) || (lang === "ar" && i.description_ar) || i.description_en;

  async function request(item: Item) {
    if (!user) return;
    setRequested((s) => new Set(s).add(item.id));
    const { error } = await supabase.from("notifications").insert({
      client_id: user.id,
      order_id: activeId,
      type: "store_interest",
      title: `Service requested: ${item.name_en}`,
      body: `We'll reach out shortly with onboarding details for ${item.name_en}.`,
      action_url: "/dashboard/support",
    });
    if (error) toast.error("Could not register interest");
    else toast.success(`Interest registered for ${item.name_en}`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><Store className="h-3 w-3" /> Services Store</>}
        title="Add new services"
        description="Expand your LaunchBridge workspace with premium add-ons, banking upgrades, and growth services."
      />

      <Link
        to="/dashboard/start"
        className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Looking to form a new company?</div>
            <div className="text-xs text-text-2">Pricing per state + intake form — start here.</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-primary" />
      </Link>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                currentCat === cat
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-card text-text-2 hover:text-foreground"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {currentCat && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.filter((i) => i.category === currentCat).map((i) => (
              <Card key={i.id} className="flex flex-col transition-transform hover:-translate-y-1">
                <h3 className="text-base font-bold text-foreground">{nameOf(i)}</h3>
                {descOf(i) && <p className="mt-2 text-xs text-text-2">{descOf(i)}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-foreground">{Number(i.price_mad).toLocaleString()} MAD</div>
                    <div className="text-[10px] text-text-3">One-time</div>
                  </div>
                  <button
                    onClick={() => request(i)}
                    disabled={requested.has(i.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {requested.has(i.id) ? <><Check className="h-3 w-3" /> Requested</> : <><Plus className="h-3 w-3" /> Add</>}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <Card className="p-8 text-center text-sm text-text-3">
          {q.isLoading ? "Loading services…" : "No services available yet."}
        </Card>
      )}
    </div>
  );
}
