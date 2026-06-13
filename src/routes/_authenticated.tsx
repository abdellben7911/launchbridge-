import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { WorkspaceProvider } from "@/hooks/useActiveWorkspace";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Auth is handled entirely client-side in AuthLayout via useAuth() + useEffect.
    // Calling getSession() here triggers during SSR hydration — before Supabase
    // has restored the session from localStorage — so logged-in users get bounced
    // to /login on every browser reopen. Skip it entirely.
    return;
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
