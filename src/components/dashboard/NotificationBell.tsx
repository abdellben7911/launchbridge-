import { useEffect, useRef, useState } from "react";
import { Bell, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, is_read, action_url, created_at")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `client_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, qc]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.is_read).length;

  const markAllRead = async () => {
    if (!user?.id || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("client_id", user.id)
      .eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
  };

  function iconFor(type: string) {
    if (type.includes("alert") || type.includes("action")) return <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />;
    if (type.includes("info") || type.includes("update")) return <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />;
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-accent"
        aria-label={t("topbar.notifications")}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-bold">{t("topbar.notifications")}</div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-semibold text-primary hover:underline">
                {t("topbar.mark_all_read")}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-text-3">{t("topbar.no_notifications")}</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((i) => (
                <li
                  key={i.id}
                  className={`flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-0 ${
                    !i.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  {iconFor(i.type)}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{i.title}</div>
                    {i.body && <div className="text-xs text-text-2">{i.body}</div>}
                    <div className="mt-0.5 text-[11px] text-text-3">
                      {new Date(i.created_at).toLocaleString(lang === "ar" ? "ar" : lang === "fr" ? "fr-FR" : "en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-accent"
          >
            {t("topbar.view_all")}
          </Link>
        </div>
      )}
    </div>
  );
}
