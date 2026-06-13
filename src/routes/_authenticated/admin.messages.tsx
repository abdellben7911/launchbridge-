import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, Loader2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

type MsgRow = {
  id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
  orders: { id: string; order_number: string | null; business_name: string | null } | null;
  profiles: { full_name: string | null; email: string } | null;
};

type Thread = {
  orderId: string;
  orderNumber: string;
  businessName: string;
  clientName: string;
  clientEmail: string;
  messages: MsgRow[];
  unread: number;
  lastAt: string;
};

function AdminMessages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async (): Promise<MsgRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select(`id, content, sender_id, is_read, created_at,
          orders:order_id (id, order_number, business_name),
          profiles:sender_id (full_name, email)`)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as unknown as MsgRow[];
    },
  });

  // Group into threads by order
  const threads: Thread[] = Object.values(
    rows.reduce<Record<string, Thread>>((acc, m) => {
      const oid = (m.orders as any)?.id ?? "unknown";
      if (!acc[oid]) {
        acc[oid] = {
          orderId: oid,
          orderNumber: (m.orders as any)?.order_number ?? oid.slice(0, 6),
          businessName: (m.orders as any)?.business_name ?? "Order",
          clientName: (m.profiles as any)?.full_name ?? (m.profiles as any)?.email ?? "Client",
          clientEmail: (m.profiles as any)?.email ?? "",
          messages: [],
          unread: 0,
          lastAt: m.created_at,
        };
      }
      acc[oid].messages.push(m);
      if (!m.is_read) acc[oid].unread++;
      if (m.created_at > acc[oid].lastAt) acc[oid].lastAt = m.created_at;
      return acc;
    }, {})
  ).sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  const activeThread = threads.find((t) => t.orderId === selected);

  const sendMut = useMutation({
    mutationFn: async () => {
      if (!selected || !draft.trim()) return;
      const me = await supabase.auth.getUser();
      const { error } = await supabase.from("messages").insert({
        order_id: selected,
        sender_id: me.data.user!.id,
        content: draft.trim(),
        is_read: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const markReadMut = useMutation({
    mutationFn: async (orderId: string) => {
      const ids = rows.filter((m) => (m.orders as any)?.id === orderId && !m.is_read).map((m) => m.id);
      if (!ids.length) return;
      await supabase.from("messages").update({ is_read: true }).in("id", ids);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const handleSelect = (orderId: string) => {
    setSelected(orderId);
    markReadMut.mutate(orderId);
  };

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-2xl border border-border bg-card">
      {/* Thread list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-lg font-extrabold text-foreground">Messages</h1>
          {totalUnread > 0 && (
            <p className="mt-0.5 text-xs text-text-3">{totalUnread} unread</p>
          )}
        </div>
        {isLoading ? (
          <div className="grid flex-1 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>
        ) : threads.length === 0 ? (
          <div className="grid flex-1 place-items-center text-sm text-text-3">No messages yet</div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-border">
            {threads.map((t) => (
              <li key={t.orderId}>
                <button
                  onClick={() => handleSelect(t.orderId)}
                  className={`w-full px-4 py-3.5 text-left transition-colors hover:bg-accent/50 ${selected === t.orderId ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-foreground">{t.clientName}</span>
                        {t.unread > 0 && (
                          <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{t.unread}</span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-text-3">{t.businessName}</div>
                      <div className="mt-1 truncate text-xs text-text-2">
                        {t.messages[t.messages.length - 1]?.content}
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-text-3" />
                  </div>
                  <div className="mt-1.5 text-[10px] text-text-3">
                    {new Date(t.lastAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat pane */}
      {!activeThread ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-3">
          <MessageSquare className="h-10 w-10 opacity-30" />
          <span className="text-sm">Select a conversation</span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <div className="font-bold text-foreground">{activeThread.clientName}</div>
              <div className="text-xs text-text-3">{activeThread.businessName} · #{activeThread.orderNumber}</div>
            </div>
            <Link
              to="/admin/orders/$orderId"
              params={{ orderId: activeThread.orderId }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View order →
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {activeThread.messages.map((m) => {
              const isAdmin = (m.profiles as any)?.email === "admin" || m.sender_id !== activeThread.messages.find(x => x.profiles)?.sender_id;
              return (
                <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                    isAdmin
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-bg-2 text-foreground border border-border rounded-bl-sm"
                  }`}>
                    <p>{m.content}</p>
                    <p className={`mt-1 text-[10px] ${isAdmin ? "text-primary-foreground/60" : "text-text-3"}`}>
                      {new Date(m.created_at).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMut.mutate(); } }}
                placeholder="Type a reply… (Enter to send)"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-border bg-bg-2 px-3 py-2.5 text-sm text-foreground placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => sendMut.mutate()}
                disabled={!draft.trim() || sendMut.isPending}
                className="self-end inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition"
              >
                {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
