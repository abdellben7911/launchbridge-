import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import stripeAsset from "@/assets/logos/stripe.svg.asset.json";
import shopifyAsset from "@/assets/logos/shopify.svg.asset.json";
import wiseAsset from "@/assets/logos/wise.svg.asset.json";
import payoneerAsset from "@/assets/logos/payoneer.svg.asset.json";
import paypalAsset from "@/assets/logos/paypal.svg.asset.json";
import mercuryAsset from "@/assets/logos/mercury.png.asset.json";

export type GatewayStatus =
  | "completed"
  | "active"
  | "pending"
  | "pending_review"
  | "action_required"
  | "not_included"
  | "online"
  | "locked"
  | "available";

const STATUS_CONFIG: Record<
  GatewayStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  online: {
    label: "Online",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
  },
  pending_review: {
    label: "Pending Review",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
  },
  action_required: {
    label: "Action Required",
    dot: "bg-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
  },
  not_included: {
    label: "Not included",
    dot: "bg-slate-300 dark:bg-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-500 dark:text-slate-400",
  },
  locked: {
    label: "Locked",
    dot: "bg-slate-300 dark:bg-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-500 dark:text-slate-400",
  },
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: GatewayStatus;
  label?: string;
  className?: string;
}) {
  const c = STATUS_CONFIG[status];
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        c.bg,
        c.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {label ?? t(`status.${status}`)}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "amber" | "rose";
  className?: string;
}) {
  const fill =
    tone === "amber"
      ? "bg-amber-500"
      : tone === "rose"
      ? "bg-rose-500"
      : "bg-primary";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-bg-2",
        className,
      )}
    >
      <div
        className={cn("progress-fill h-full rounded-full transition-transform", fill)}
        style={{ width: "100%", transform: `scaleX(${pct / 100})`, transformOrigin: "var(--rtl-origin, left)" }}
      />
    </div>
  );
}

export type GatewayKey =
  | "stripe"
  | "shopify"
  | "wise"
  | "payoneer"
  | "paypal"
  | "airwallex"
  | "mercury"
  | "relay"
  | "etsy"
  | "ebay";

const LOGO_MAP: Partial<Record<GatewayKey, string>> = {
  stripe: stripeAsset.url,
  shopify: shopifyAsset.url,
  wise: wiseAsset.url,
  payoneer: payoneerAsset.url,
  paypal: paypalAsset.url,
  mercury: mercuryAsset.url,
};

const INITIAL_TONES: Record<GatewayKey, string> = {
  stripe: "bg-[#635bff] text-white",
  shopify: "bg-[#95bf47] text-white",
  wise: "bg-[#9fe870] text-[#163300]",
  payoneer: "bg-[#ff4800] text-white",
  paypal: "bg-[#003087] text-white",
  airwallex: "bg-[#612FFF] text-white",
  mercury: "bg-slate-900 text-white",
  relay: "bg-sky-600 text-white",
  etsy: "bg-[#f56400] text-white",
  ebay: "bg-white text-slate-900 border border-slate-200",
};

export function GatewayLogo({
  gateway,
  muted = false,
  size = "md",
}: {
  gateway: GatewayKey;
  muted?: boolean;
  size?: "sm" | "md";
}) {
  const url = LOGO_MAP[gateway];
  const px = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  if (url) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-2xl bg-white p-2 shadow-soft",
          px,
          muted && "opacity-50 grayscale",
        )}
      >
        <img
          src={url}
          alt={gateway}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }
  // Fallback: stylized initial tile
  const label = gateway === "ebay" ? "eb" : gateway.slice(0, 2);
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl font-bold capitalize shadow-soft",
        px,
        INITIAL_TONES[gateway],
        muted && "opacity-50 grayscale",
        size === "sm" ? "text-sm" : "text-base",
      )}
    >
      {label}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SegmentedProgressBar({
  segments,
  className,
}: {
  segments: { value: number; color: string; label?: string }[];
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className={cn("flex h-2.5 w-full overflow-hidden rounded-full bg-bg-2", className)}>
      {segments.map((s, i) => (
        <div
          key={i}
          className={cn("h-full transition-all", s.color)}
          style={{ width: `${(s.value / total) * 100}%` }}
          title={s.label}
        />
      ))}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  trend = "flat",
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
}) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-text-3";
  return (
    <Card>
      <div className="text-[11px] font-bold uppercase tracking-wider text-text-3">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-foreground">{value}</div>
      {delta && (
        <div className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold", trendColor)}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {delta}
        </div>
      )}
      {hint && <div className="mt-2 text-xs text-text-3">{hint}</div>}
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  status,
  description,
  right,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  status?: GatewayStatus;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-3">
            {eyebrow}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
          {status && <StatusPill status={status} />}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-text-2">{description}</p>
        )}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

// ─── Demo data ────────────────────────────────────────────────
export const DEMO = {
  company: {
    legalEntity: "Carter Holdings LLC",
    entityType: "LLC",
    state: "Wyoming",
    formationDate: "Apr 28, 2025",
    responsibleParty: "Michael Carter",
    federalEin: "33-••••••••",
    einStatus: "pending" as const,
    einProgress: 30,
  },
  services: {
    phoneNumber: "+1 (786) 555-0198",
    loginEmail: "client@launchbridge.com",
    domain: "carterholdings.com",
    websiteProgress: 68,
  },
  primaryGateways: [
    { key: "stripe" as GatewayKey, name: "Stripe", status: "completed" as GatewayStatus },
    { key: "shopify" as GatewayKey, name: "Shopify", status: "pending" as GatewayStatus },
    { key: "wise" as GatewayKey, name: "Wise", status: "completed" as GatewayStatus },
    { key: "payoneer" as GatewayKey, name: "Payoneer", status: "pending" as GatewayStatus },
    { key: "paypal" as GatewayKey, name: "PayPal", status: "active" as GatewayStatus },
  ],
  bankingGateways: [
    { key: "airwallex" as GatewayKey, name: "Airwallex", status: "action_required" as GatewayStatus },
    { key: "mercury" as GatewayKey, name: "Mercury", status: "pending_review" as GatewayStatus },
    { key: "relay" as GatewayKey, name: "Relay", status: "not_included" as GatewayStatus },
    { key: "etsy" as GatewayKey, name: "Etsy", status: "not_included" as GatewayStatus },
    { key: "ebay" as GatewayKey, name: "eBay", status: "not_included" as GatewayStatus },
  ],
  specialist: {
    name: "Sarah Lin",
    initials: "SL",
    role: "Senior onboarding specialist",
    lastUpdate: "May 20 · 09:42",
  },
  updates: [
    {
      kind: "alert" as const,
      title: "Airwallex needs a proof of address",
      date: "May 22 · action required from you",
    },
    {
      kind: "done" as const,
      title: "Stripe is live and accepting payments",
      date: "May 20 · 09:42",
    },
    {
      kind: "done" as const,
      title: "EIN application submitted to the IRS",
      date: "May 18 · 14:10",
    },
    {
      kind: "done" as const,
      title: "Domain & professional email activated",
      date: "May 10 · 11:25",
    },
  ],
};

export const actionRequiredCount =
  DEMO.bankingGateways.filter(
    (g) => g.status === "action_required" || g.status === "pending_review",
  ).length;
