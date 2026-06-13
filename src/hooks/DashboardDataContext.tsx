/**
 * DashboardDataContext
 *
 * Wraps `useDashboardData()` into a React context so the hook runs exactly
 * ONCE per dashboard session (inside DashboardLayout). Child routes consume
 * the data via `useDashboardDataCtx()` without creating extra Realtime
 * subscriptions, which was causing:
 *   "cannot add `postgres_changes` callbacks after `subscribe()`"
 */
import { createContext, useContext, type ReactNode } from "react";
import { useDashboardData } from "./useDashboardData";

type DashboardDataCtxValue = ReturnType<typeof useDashboardData>;

const Ctx = createContext<DashboardDataCtxValue | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const data = useDashboardData();
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useDashboardDataCtx(): DashboardDataCtxValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardDataCtx must be used inside DashboardDataProvider");
  return ctx;
}
