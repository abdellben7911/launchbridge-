import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceProvider } from "@/hooks/useActiveWorkspace";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    // Block access until email is verified
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
  const { loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-text-2">Loading…</div>;
  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}
