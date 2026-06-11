import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "client" | "admin" | "support";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  flag_emoji: string | null;
  currency: string | null;
  language: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
};

type AuthCtx = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  hasRole: (r: AppRole) => boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function loadProfileAndRoles(userId: string) {
  const [p, r] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  return {
    profile: (p.data as Profile | null) ?? null,
    roles: ((r.data ?? []) as { role: AppRole }[]).map((x) => x.role),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const router = useRouter();
  const qc = useQueryClient();

  const hydrate = async (s: Session | null) => {
    setSession(s);
    if (s?.user) {
      // defer to avoid deadlocks per supabase recommendation
      setTimeout(async () => {
        const { profile, roles } = await loadProfileAndRoles(s.user.id);
        setProfile(profile);
        setRoles(roles);
      }, 0);
    } else {
      setProfile(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      hydrate(s);
      router.invalidate();
      qc.invalidateQueries();
    });
    // Then get existing
    supabase.auth.getSession().then(async ({ data }) => {
      await hydrate(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthCtx = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isAuthenticated: !!session,
    hasRole: (r) => roles.includes(r),
    isStaff: roles.includes("admin") || roles.includes("support"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      if (session?.user) {
        const { profile, roles } = await loadProfileAndRoles(session.user.id);
        setProfile(profile);
        setRoles(roles);
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
