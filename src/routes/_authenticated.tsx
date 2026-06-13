import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceProvider } from "@/hooks/useActiveWorkspace";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // On the server (SSR / Cloudflare Workers) there is no localStorage,
    // so supabase.auth.getSession() always returns null — which would redirect
    // every returning user to /login even though their session is in the browser.
    // We skip the check server-side and let AuthLayout handle it on the client.
    if (typeof window === "undefined") return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (!data.session.user.email_confirmed_at) {
      throw redirect({
        to: "/verify-email",
        search: { email: data.session.user.email ?? "" },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { loading, isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  // Client-side guard: once auth state is resolved, redirect if not logged in.
  // This handles the SSR case where beforeLoad was skipped on the server.
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: href } });
      return;
    }
    // Block unverified emails
    if (session?.user && !session.user.email_confirmed_at) {
      navigate({ to: "/verify-email", search: { email: session.user.email ?? "" } });
    }
  }, [loading, isAuthenticated, session, navigate, href]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}
