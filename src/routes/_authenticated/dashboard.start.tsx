import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Building2, Check, Truck, Star, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, Card } from "@/components/dashboard/shared";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/start")({
  component: StartCompanyPage,
});

type Service = {
  id: string;
  slug: string;
  name_en: string;
  features: { k: string }[] | null;
  us_state: string | null;
  tier: string | null;
  price_mad: number | null;
  original_price_mad: number | null;
  delivery_days: number | null;
  badge_key: string | null;
  group_key: string | null;
  sort_order: number | null;
};

const STATES = [
  { key: "wyoming", label: "Wyoming", sub: "Most popular for non-residents — Stripe & PayPal friendly" },
  { key: "montana", label: "Montana", sub: "Fastest, most affordable — perfect for a strong start" },
  { key: "new_mexico", label: "New Mexico", sub: "Cheapest path for beginners — no complications" },
];

const TIER_LABEL: Record<string, string> = {
  basic: "BASIC",
  ultimate: "ULTIMATE",
  ultimate_launch: "ULTIMATE LAUNCH",
};
const TIER_INDEX: Record<string, string> = { basic: "01", ultimate: "02", ultimate_launch: "03" };
const TIER_ORDER: Record<string, number> = { basic: 1, ultimate: 2, ultimate_launch: 3 };

const FEATURE_COPY: Record<string, string> = {
  llc_creation: "LLC Creation",
  registered_agent: "Registered Agent",
  us_phone: "US Phone Number",
  ein: "EIN",
  stripe_2: "2× Stripe",
  paypal_business: "PayPal Business",
  wise_business: "Wise Business",
  mercury_account: "Mercury Account",
  payoneer_business: "Payoneer Business",
  shopify_payment: "Shopify Payment",
  all_ultimate: "Everything in Ultimate",
  store_setup: "Shopify or WordPress store setup",
};

function StartCompanyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeState, setActiveState] = useState("wyoming");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    llcOption1: "",
    llcOption2: "",
    state: "",
    serviceId: "",
    websiteLink: "",
    hasPartner: "no",
    partnerInfo: "",
    signature: "",
  });

  const setField = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const q = useQuery({
    queryKey: ["formation-packages"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("id, slug, name_en, features, us_state, tier, price_mad, original_price_mad, delivery_days, badge_key, group_key, sort_order")
        .not("group_key", "is", null)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Service[];
    },
  });

  const grouped = useMemo(() => {
    const out: Record<string, Service[]> = { wyoming: [], montana: [], new_mexico: [] };
    (q.data ?? []).forEach((s) => {
      if (s.group_key && out[s.group_key]) out[s.group_key].push(s);
    });
    Object.values(out).forEach((arr) =>
      arr.sort((a, b) => (TIER_ORDER[a.tier ?? ""] ?? 99) - (TIER_ORDER[b.tier ?? ""] ?? 99)),
    );
    return out;
  }, [q.data]);

  const cards = grouped[activeState] ?? [];
  const allServices = q.data ?? [];

  function selectPackage(s: Service) {
    setForm((f) => ({ ...f, serviceId: s.id, state: s.group_key ?? activeState }));
    document.getElementById("intake-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Map service feature keys → gateway keys (used to populate intake.addons)
  const FEATURE_TO_GW: Record<string, string> = {
    stripe_2: "stripe",
    paypal_business: "paypal",
    wise_business: "wise",
    mercury_account: "mercury",
    payoneer_business: "payoneer",
    shopify_payment: "shopify",
  };
  // all_ultimate includes all Ultimate gateways
  const ULTIMATE_GW = ["stripe", "paypal", "wise", "payoneer", "shopify"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.serviceId) {
      toast.error("Please choose a formation package first");
      return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.llcOption1 || !form.signature) {
      toast.error("Please complete the required fields");
      return;
    }
    setSubmitting(true);

    // Derive included gateways from the chosen service's features
    const selectedService = allServices.find((s) => s.id === form.serviceId);
    const features: { k: string }[] = selectedService?.features ?? [];
    const hasAllUltimate = features.some((f) => f.k === "all_ultimate");
    const directGateways = features.map((f) => FEATURE_TO_GW[f.k]).filter(Boolean);
    const includedGateways = hasAllUltimate
      ? [...new Set([...ULTIMATE_GW, ...directGateways])]
      : directGateways;

    const addons = {
      us_phone: features.some((f) => f.k === "us_phone"),
      website: features.some((f) => f.k === "store_setup"),
      gateways: includedGateways as string[],
    };

    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      service_id: form.serviceId,
      business_name: form.llcOption1,
      us_state: form.state,
      intake: {
        contact: {
          first_name: form.firstName,
          last_name: form.lastName,
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
        },
        address: { line1: form.address, city: form.city, zip: form.zip },
        llc: { option1: form.llcOption1, option2: form.llcOption2, state: form.state },
        website_link: form.websiteLink,
        partner: { has: form.hasPartner === "yes", info: form.partnerInfo },
        signature: form.signature,
        signed_at: new Date().toISOString(),
        addons,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not submit. Please try again.");
      return;
    }
    // Flush all cached queries so the dashboard sees the new order immediately
    await qc.invalidateQueries();
    toast.success("Order submitted — your workspace is being created.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow={<><Building2 className="h-3 w-3" /> Start your company</>}
        title="Choose your state and package"
        description="Pick the state that fits your business, then fill in the intake form below. We handle filing, EIN, registered agent, and onboarding."
      />

      {/* State tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
          {STATES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveState(s.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeState === s.key ? "bg-primary text-primary-foreground" : "text-text-2 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <p className="-mt-6 text-center text-sm text-text-2">{STATES.find((s) => s.key === activeState)?.sub}</p>

      {/* Pricing cards */}
      {q.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[460px] animate-pulse rounded-[24px] border border-border bg-card" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((s) => {
            const featured = !!s.badge_key;
            const selected = form.serviceId === s.id;
            return (
              <div
                key={s.id}
                className={`relative flex flex-col rounded-[24px] p-6 transition-all ${
                  selected
                    ? "border-2 border-primary bg-primary/5 shadow-dramatic"
                    : featured
                    ? "border-2 border-primary bg-card shadow-dramatic md:scale-[1.02]"
                    : "border border-border bg-card shadow-soft hover:shadow-elegant"
                }`}
              >
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-[11px] font-bold text-amber-950 shadow-elegant">
                      <Star className="h-3 w-3 fill-current" /> Recommended
                    </div>
                  </div>
                )}
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {s.tier === "ultimate_launch" ? <Crown className="h-3 w-3" /> : null}
                  <span>{TIER_INDEX[s.tier ?? ""] ?? ""} — {TIER_LABEL[s.tier ?? ""] ?? s.name_en}</span>
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-primary">
                    {new Intl.NumberFormat("fr-FR").format(s.price_mad ?? 0)}
                  </span>
                  <span className="text-base font-bold text-primary">MAD</span>
                </div>
                {s.original_price_mad ? (
                  <div className="mt-1 text-sm text-text-3 line-through">
                    {new Intl.NumberFormat("fr-FR").format(s.original_price_mad)} MAD
                  </div>
                ) : null}
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2 text-xs font-semibold text-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  Delivery: {s.delivery_days ?? "—"} day{(s.delivery_days ?? 0) === 1 ? "" : "s"}
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {(s.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-2">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span>{FEATURE_COPY[f.k] ?? f.k}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => selectPackage(s)}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                    selected
                      ? "bg-emerald-600 text-white"
                      : featured
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background"
                  }`}
                >
                  {selected ? <><Check className="h-4 w-4" /> Selected</> : <>Choose this package <ArrowRight className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Intake form */}
      <div id="intake-form" className="scroll-mt-24">
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Your information</h2>
          <p className="mt-1 text-sm text-text-2">
            We use this to file your LLC and set up your accounts. Fields marked with <span className="text-rose-500">*</span> are required.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <input className={input} value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
            </Field>
            <Field label="Last name" required>
              <input className={input} value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
            </Field>
          </div>
          <Field label="Email" required>
            <input type="email" className={input} value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </Field>
          <Field label="Phone number" required>
            <input className={input} placeholder="+1 202 555 0142" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </Field>
          <Field label="Physical address">
            <input className={input} value={form.address} onChange={(e) => setField("address", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <input className={input} value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </Field>
            <Field label="Zip / Postal">
              <input className={input} value={form.zip} onChange={(e) => setField("zip", e.target.value)} />
            </Field>
          </div>
          <Field label="LLC Name: Option 1" required>
            <input className={input} value={form.llcOption1} onChange={(e) => setField("llcOption1", e.target.value)} />
          </Field>
          <Field label="LLC Name: Option 2">
            <input className={input} value={form.llcOption2} onChange={(e) => setField("llcOption2", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="State" required>
              <select
                className={input}
                value={form.state}
                onChange={(e) => {
                  setField("state", e.target.value);
                  setActiveState(e.target.value);
                  setField("serviceId", "");
                }}
              >
                <option value="">Select a state</option>
                {STATES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Package" required>
              <select className={input} value={form.serviceId} onChange={(e) => setField("serviceId", e.target.value)}>
                <option value="">Select a package</option>
                {allServices
                  .filter((s) => !form.state || s.group_key === form.state)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {(TIER_LABEL[s.tier ?? ""] ?? s.name_en)} — {new Intl.NumberFormat("fr-FR").format(s.price_mad ?? 0)} MAD
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <Field label="Website link (if available)">
            <input className={input} placeholder="https://" value={form.websiteLink} onChange={(e) => setField("websiteLink", e.target.value)} />
          </Field>
          <Field label="Do you have a partner?">
            <select className={input} value={form.hasPartner} onChange={(e) => setField("hasPartner", e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {form.hasPartner === "yes" && (
            <Field label="Partner information">
              <textarea
                rows={3}
                className={input}
                placeholder="Partner full name, email, ownership %"
                value={form.partnerInfo}
                onChange={(e) => setField("partnerInfo", e.target.value)}
              />
            </Field>
          )}
          <Field label="Signature (type your full legal name)" required>
            <input
              className={`${input} font-serif italic`}
              placeholder="Your full legal name"
              value={form.signature}
              onChange={(e) => setField("signature", e.target.value)}
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="text-xs text-text-3">
              By submitting you authorize LaunchBridge to act as your formation agent.
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-60"
            >
              {submitting ? "Submitting…" : <>Submit & start formation <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
