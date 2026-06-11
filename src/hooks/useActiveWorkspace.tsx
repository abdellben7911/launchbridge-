import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Workspace = {
  id: string;
  business_name: string | null;
  workspace_name: string | null;
  workspace_status: string;
  us_state: string | null;
  status: string;
  created_at: string;
};

type Ctx = {
  workspaces: Workspace[];
  active: Workspace | null;
  activeId: string | null;
  setActiveId: (id: string) => void;
  loading: boolean;
};

const WorkspaceContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "lb.activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const q = useQuery({
    queryKey: ["my-workspaces", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Workspace[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, business_name, workspace_name, workspace_status, us_state, status, created_at")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Workspace[];
    },
  });

  const workspaces = q.data ?? [];

  // If no active id or active id is no longer in the list, default to the first
  useEffect(() => {
    if (!workspaces.length) return;
    if (!activeId || !workspaces.find((w) => w.id === activeId)) {
      const next = workspaces[0].id;
      setActiveIdState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
    }
  }, [workspaces, activeId]);

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    // Invalidate every workspace-keyed query
    qc.invalidateQueries();
  };

  const active = useMemo(
    () => workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null,
    [workspaces, activeId],
  );

  const value: Ctx = {
    workspaces,
    active,
    activeId: active?.id ?? null,
    setActiveId,
    loading: q.isLoading,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useActiveWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useActiveWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function workspaceLabel(w: Workspace | null | undefined): string {
  if (!w) return "Your workspace";
  return w.workspace_name ?? w.business_name ?? "Untitled LLC";
}
