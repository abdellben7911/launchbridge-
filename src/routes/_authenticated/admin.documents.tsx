import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Check, X, ExternalLink, Loader2, Filter, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/documents")({
  component: AdminDocuments,
});

type DocRow = {
  id: string;
  name: string;
  type: string;
  direction: string;
  status: string;
  file_path: string | null;
  created_at: string;
  order_id: string;
  orders: {
    id: string;
    order_number: string | null;
    business_name: string | null;
    client_id: string;
    profiles: { full_name: string | null; email: string } | null;
  } | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  locked: "bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400",
};

const TYPE_LABEL: Record<string, string> = {
  id_front: "ID — Front",
  id_back: "ID — Back",
  proof_address: "Proof of Address",
  passport: "Passport",
  formation: "Formation Doc",
  ein_letter: "EIN Letter (CP-575)",
  operating_agreement: "Operating Agreement",
  other: "Other",
};

function AdminDocuments() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [preview, setPreview] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-documents", statusFilter],
    queryFn: async (): Promise<DocRow[]> => {
      let q = supabase
        .from("documents")
        .select(`id, name, type, direction, status, file_path, created_at, order_id,
          orders:order_id (id, order_number, business_name, client_id,
            profiles:client_id (full_name, email))`)
        .order("created_at", { ascending: false })
        .limit(300);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as DocRow[];
    },
  });

  const reviewMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("documents").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(status === "approved" ? "Document approved" : "Document rejected");
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
    },
  });

  const openPreview = async (doc: DocRow) => {
    if (!doc.file_path) return;
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) setPreview(data.signedUrl);
  };

  const counts = { all: data.length, pending: 0, approved: 0, rejected: 0 };
  // We only have the filtered count — show badge on tab
  const TABS = ["pending", "approved", "rejected", "all"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Documents</h1>
          <p className="mt-1 text-sm text-text-2">Review client-uploaded documents and approve or reject</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-bg-2/60 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              statusFilter === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid h-32 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-3" />
        </div>
      ) : data.length === 0 ? (
        <div className="grid h-40 place-items-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center gap-2 text-text-3">
            <Filter className="h-8 w-8 opacity-40" />
            <span className="text-sm">No {statusFilter === "all" ? "" : statusFilter} documents</span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-2/60">
                {["Document", "Client / Order", "Type", "Direction", "Uploaded", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((doc) => {
                const order = doc.orders as any;
                const client = order?.profiles;
                const isPending = doc.status === "pending";
                return (
                  <tr key={doc.id} className="transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="font-semibold text-foreground">{client?.full_name ?? client?.email ?? "—"}</div>
                        {order && (
                          <Link
                            to="/admin/orders/$orderId"
                            params={{ orderId: order.id }}
                            className="inline-flex items-center gap-0.5 text-primary hover:underline"
                          >
                            #{order.order_number ?? order.id.slice(0, 6)}
                            {order.business_name && ` · ${order.business_name}`}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">
                      {TYPE_LABEL[doc.type] ?? doc.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        doc.direction === "client_upload"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                          : "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                      }`}>
                        {doc.direction === "client_upload" ? "Client upload" : "From LaunchBridge"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-text-3">
                      {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_STYLES[doc.status] ?? "bg-accent text-text-2"}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {doc.file_path && (
                          <button
                            onClick={() => openPreview(doc)}
                            className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-text-2 hover:bg-accent/70 transition"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {isPending && (
                          <>
                            <button
                              onClick={() => reviewMut.mutate({ id: doc.id, status: "approved" })}
                              disabled={reviewMut.isPending}
                              className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 transition"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => reviewMut.mutate({ id: doc.id, status: "rejected" })}
                              disabled={reviewMut.isPending}
                              className="grid h-7 w-7 place-items-center rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 transition"
                              title="Reject"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {order?.client_id && (
                          <Link
                            to="/admin/clients/$clientId"
                            params={{ clientId: order.client_id }}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-border text-text-2 hover:bg-accent transition"
                            title="Manage client"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-[90vh] max-w-3xl overflow-auto rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-accent text-foreground hover:bg-accent/70"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={preview} alt="Document preview" className="max-h-[85vh] w-auto rounded-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
