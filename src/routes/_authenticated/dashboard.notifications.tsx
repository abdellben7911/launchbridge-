import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, Card } from "@/components/dashboard/shared";
import { Bell, AlertCircle, CheckCircle2, Info, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  component: NotificationsPage,
});

type Row = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications-page", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, is_read, action_url, created_at")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`notif-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `client_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications-page", user.id] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, qc]);

  const items = q.data ?? [];
  const unread = items.filter((i) => !i.is_read).length;

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications-page", user?.id] });
    qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("client_id", user.id).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications-page", user.id] });
    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
  }

  function iconFor(type: string) {
    if (type.includes("alert") || type.includes("action")) return <AlertCircle className="h-5 w-5 text-rose-500" />;
    if (type.includes("info") || type.includes("update")) return <Info className="h-5 w-5 text-sky-500" />;
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><Bell className="h-3 w-3" /> Notifications</>}
        title="All updates"
        description={unread > 0 ? `You have ${unread} unread notifications.` : "You're all caught up."}
        right={
          unread > 0 ? (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Card className="p-12 text-center text-sm text-text-3">No notifications yet.</Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start gap-4 !p-4 transition-transform hover:-translate-y-px ${
                !n.is_read ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bg-2">
                {iconFor(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-foreground">{n.title}</span>
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                {n.body && <p className="mt-0.5 text-xs text-text-2">{n.body}</p>}
                <div className="mt-1 text-[11px] text-text-3">
                  {new Date(n.created_at).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="rounded-full px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
