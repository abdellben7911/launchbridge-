import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import type { GatewayKey, GatewayStatus } from "@/components/dashboard/shared";

export type OrderRow = {
  id: string;
  order_number: string | null;
  service_id: string | null;
  status: string;
  payment_status: string | null;
  business_name: string | null;
  business_type: string | null;
  us_state: string | null;
  industry: string | null;
  submitted_at: string | null;
  filed_at: string | null;
  ein_received_at: string | null;
  banking_done_at: string | null;
  completed_at: string | null;
  total_usd: number | null;
  currency_paid: string | null;
  intake: IntakeShape | null;
  preferred_channel: string | null;
  created_at: string;
};

export type IntakeShape = {
  contact?: {
    full_name?: string;
    whatsapp?: string;
    phone?: string;
    email?: string;
    preferred_channel?: "whatsapp" | "phone" | "email";
    preferred_time?: string;
  };
  addons?: {
    us_phone?: boolean;
    website?: boolean;
    gateways?: GatewayKey[];
  };
  services?: {
    phone?: { status?: GatewayStatus; number?: string; login_email?: string };
    website?: { status?: GatewayStatus; domain?: string; progress?: number };
    gateways?: Record<string, { status?: GatewayStatus; note?: string }>;
  };
  notes?: string;
};

export type TimelineRow = {
  id: string;
  status: string;
  note_en: string | null;
  note_fr: string | null;
  note_ar: string | null;
  created_at: string;
};

export type DocRow = {
  id: string;
  name: string;
  type: string;
  direction: string;
  status: string;
  file_path: string | null;
  created_at: string;
};

const FEATURE_TO_GW: Record<string, string> = {
  stripe_2: "stripe",
  paypal_business: "paypal",
  wise_business: "wise",
  mercury_account: "mercury",
  payoneer_business: "payoneer",
  shopify_payment: "shopify",
};
const ULTIMATE_GW = ["stripe", "paypal", "wise", "payoneer", "shopify"];

export function useDashboardData() {
  const { user } = useAuth();
  const { activeId } = useActiveWorkspace();
  const qc = useQueryClient();
  const uid = user?.id;

  const orderQ = useQuery({
    queryKey: ["my-order", uid, activeId],
    enabled: !!uid,
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(
          "id, order_number, service_id, status, payment_status, business_name, business_type, us_state, industry, submitted_at, filed_at, ein_received_at, banking_done_at, completed_at, total_usd, currency_paid, intake, preferred_channel, created_at",
        )
        .eq("client_id", uid!);
      if (activeId) query = query.eq("id", activeId);
      else query = query.order("created_at", { ascending: false }).limit(1);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return (data as OrderRow | null) ?? null;
    },
  });

  const orderId = orderQ.data?.id;
  const serviceId = orderQ.data?.service_id as string | undefined;

  // Fallback: fetch service features so we know which gateways are included
  // even for orders submitted before we stored addons in the intake
  const serviceQ = useQuery({
    queryKey: ["service-features", serviceId],
    enabled: !!serviceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("features")
        .eq("id", serviceId!)
        .maybeSingle();
      if (error) throw error;
      const features: { k: string }[] = (data?.features as { k: string }[] | null) ?? [];
      const hasAllUltimate = features.some((f) => f.k === "all_ultimate");
      const direct = features.map((f) => FEATURE_TO_GW[f.k]).filter(Boolean);
      return hasAllUltimate ? [...new Set([...ULTIMATE_GW, ...direct])] : direct;
    },
    staleTime: Infinity, // service features never change
  });

  const timelineQ = useQuery({
    queryKey: ["my-order-timeline", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_timeline")
        .select("id, status, note_en, note_fr, note_ar, created_at")
        .eq("order_id", orderId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TimelineRow[];
    },
  });

  const docsQ = useQuery({
    queryKey: ["my-order-docs", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, name, type, direction, status, file_path, created_at")
        .eq("order_id", orderId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocRow[];
    },
  });

  // Realtime: invalidate caches on any change touching this order
  useEffect(() => {
    if (!orderId || !uid) return;
    const ch = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["my-order", uid] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_timeline", filter: `order_id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["my-order-timeline", orderId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `order_id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["my-order-docs", orderId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [orderId, uid, qc]);

  const view = useMemo(
    () => buildView(orderQ.data, timelineQ.data, docsQ.data, serviceQ.data),
    [orderQ.data, timelineQ.data, docsQ.data, serviceQ.data],
  );

  return {
    loading: orderQ.isLoading,
    order: orderQ.data ?? null,
    timeline: timelineQ.data ?? [],
    documents: docsQ.data ?? [],
    ...view,
  };
}

function buildView(
  order: OrderRow | null | undefined,
  timeline?: TimelineRow[],
  docs?: DocRow[],
  serviceGateways?: string[],
) {
  if (!order) {
    const PRIMARY: GatewayKey[] = ["stripe", "shopify", "wise", "payoneer", "paypal"];
    const BANKING: GatewayKey[] = ["airwallex", "mercury", "relay", "etsy", "ebay"];
    const blankGateway = (k: GatewayKey, name: string) => ({
      key: k,
      name,
      status: "not_included" as GatewayStatus,
    });
    return {
      hasOrder: false,
      company: {
        legalEntity: "—",
        entityType: "—",
        state: "—",
        formationDate: "—",
        responsibleParty: "—",
        federalEin: "—",
        einStatus: "pending" as GatewayStatus,
        einProgress: 0,
      },
      services: {
        phoneNumber: "—",
        loginEmail: "—",
        domain: "—",
        websiteProgress: 0,
      },
      primaryGateways: PRIMARY.map((k) =>
        blankGateway(k, k.charAt(0).toUpperCase() + k.slice(1)),
      ),
      bankingGateways: BANKING.map((k) =>
        blankGateway(k, k === "ebay" ? "eBay" : k.charAt(0).toUpperCase() + k.slice(1)),
      ),
      specialist: { name: "—", initials: "—", role: "—", lastUpdate: "—" },
      updates: [] as { kind: "alert" | "done"; title: string; date: string }[],
      actionRequiredCount: 0,
    };
  }
  const intake = (order.intake ?? {}) as IntakeShape;
  const einStatus: GatewayStatus = order.ein_received_at
    ? "completed"
    : order.filed_at
    ? "pending_review"
    : order.submitted_at
    ? "pending"
    : "pending";
  const einProgress = order.ein_received_at
    ? 100
    : order.filed_at
    ? 70
    : order.submitted_at
    ? 30
    : 10;
  const company = {
    legalEntity: order.business_name ?? "—",
    entityType: order.business_type ?? "LLC",
    state: order.us_state ?? "—",
    formationDate: order.submitted_at
      ? new Date(order.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    responsibleParty: intake.contact?.full_name ?? "—",
    federalEin: order.ein_received_at ? "33-XXXXXXX" : "33-••••••••",
    einStatus,
    einProgress,
  };
  const services = {
    phoneNumber: intake.services?.phone?.number ?? "Pending setup",
    loginEmail: intake.services?.phone?.login_email ?? order.intake?.contact?.email ?? "—",
    domain: intake.services?.website?.domain ?? "Pending setup",
    websiteProgress: intake.services?.website?.progress ?? 0,
  };
  const PRIMARY: GatewayKey[] = ["stripe", "shopify", "wise", "payoneer", "paypal"];
  const BANKING: GatewayKey[] = ["airwallex", "mercury", "relay", "etsy", "ebay"];
  const gw = intake.services?.gateways ?? {};

  // Priority: admin-set per-gateway status > intake.addons.gateways > service feature lookup > empty
  const intakeGateways = intake.addons?.gateways as string[] | undefined;
  const resolvedIncluded = intakeGateways ?? serviceGateways ?? [];
  const includedSet = new Set(resolvedIncluded);

  const mapGW = (key: GatewayKey, name: string) => ({
    key,
    name,
    status: (gw[key]?.status ?? (includedSet.has(key) ? "pending" : "not_included")) as GatewayStatus,
  });
  const primaryGateways = PRIMARY.map((k) =>
    mapGW(k, k.charAt(0).toUpperCase() + k.slice(1)),
  );
  const bankingGateways = BANKING.map((k) =>
    mapGW(k, k === "ebay" ? "eBay" : k.charAt(0).toUpperCase() + k.slice(1)),
  );
  const actionRequiredCount = [...primaryGateways, ...bankingGateways].filter(
    (g) => g.status === "action_required" || g.status === "pending_review",
  ).length;
  const updates = (timeline ?? []).slice(0, 8).map((t) => ({
    kind: t.status.toLowerCase().includes("action") || t.status.toLowerCase().includes("required")
      ? ("alert" as const)
      : ("done" as const),
    title: t.note_en ?? t.status,
    date: new Date(t.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  return {
    hasOrder: true,
    company,
    services,
    primaryGateways,
    bankingGateways,
    specialist: { name: "—", initials: "—", role: "Onboarding specialist", lastUpdate: "—" },
    updates,
    actionRequiredCount,
    docs,
  };
}
