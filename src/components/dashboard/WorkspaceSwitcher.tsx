import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Plus, Check } from "lucide-react";
import { useActiveWorkspace, workspaceLabel, type Workspace } from "@/hooks/useActiveWorkspace";
import { StatusPill, type GatewayStatus } from "@/components/dashboard/shared";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

function statusFor(w: Workspace): GatewayStatus {
  if (w.workspace_status === "dissolved") return "locked";
  if (w.status === "completed") return "active";
  if (w.status === "pending_payment") return "pending";
  if (w.workspace_status === "draft") return "pending";
  return "active";
}

export function WorkspaceSwitcher() {
  const { workspaces, active, setActiveId } = useActiveWorkspace();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition-colors hover:bg-accent"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-black text-primary-foreground">
          LB
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {workspaceLabel(active)}
          </div>
          <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-text-3">
            {t("llc.private_infra")}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="max-h-72 overflow-y-auto p-1">
            {workspaces.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-text-3">{t("llc.no_workspaces")}</div>
            )}
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setActiveId(w.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm transition-colors hover:bg-accent",
                  active?.id === w.id && "bg-accent",
                )}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[10px] font-bold uppercase text-primary">
                  {(workspaceLabel(w) || "LB").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {workspaceLabel(w)}
                  </div>
                  <div className="truncate text-[10px] text-text-3">
                    {w.us_state ?? "—"} · LLC
                  </div>
                </div>
                <StatusPill status={statusFor(w)} className="text-[9px]" />
                {active?.id === w.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            ))}
          </div>
          <Link
            to="/start"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            {t("llc.create_new")}
          </Link>
        </div>
      )}
    </div>
  );
}
