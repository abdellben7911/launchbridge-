import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText, Download, Lock, Loader2, ExternalLink,
  ShieldCheck, Headphones, Sparkles,
} from "lucide-react";
import { useDashboardDataCtx } from "@/hooks/DashboardDataContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/documents")({
  component: DocumentsPage,
});

type DocRow = {
  id: string;
  name: string;
  type: string;
  direction: string;
  status: string;
  file_path: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  formation:          "Articles of Organization",
  ein_letter:         "EIN / CP-575 Letter",
  operating_agreement:"Operating Agreement",
  id_front:           "ID — Front",
  id_back:            "ID — Back",
  proof_address:      "Proof of Address",
  passport:           "Passport",
  other:              "Additional Document",
};

const TYPE_ICON: Record<string, string> = {
  formation:          "🏛️",
  ein_letter:         "🔢",
  operating_agreement:"📋",
  other:              "📄",
};

// Documents sent FROM LaunchBridge that the client can download
const CLIENT_DOWNLOAD_TYPES = [
  "formation",
  "ein_letter",
  "operating_agreement",
  "other",
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  approved:  { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", label: "Ready" },
  pending:   { bg: "bg-amber-100 dark:bg-amber-500/20",    text: "text-amber-700 dark:text-amber-300",    label: "In preparation" },
  rejected:  { bg: "bg-rose-100 dark:bg-rose-500/20",      text: "text-rose-700 dark:text-rose-300",      label: "Needs review" },
};

function DocumentsPage() {
  const { order, documents, loading } = useDashboardDataCtx() as {
    order: { id: string } | null;
    documents: DocRow[];
    loading: boolean;
  };

  const [downloading, setDownloading] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Documents</h1>
        <p className="mt-2 text-sm text-text-2">
          Your company documents will appear here once your formation order is placed and processed.
        </p>
        <Link
          to="/dashboard/start"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Start your U.S. company
        </Link>
      </div>
    );
  }

  // Only show docs uploaded BY LaunchBridge for this client
  const launchbridgeDocs = documents.filter(
    (d) => d.direction !== "client_upload" && CLIENT_DOWNLOAD_TYPES.includes(d.type),
  );

  // Expected documents that aren't ready yet (for the checklist)
  const readyTypes = new Set(launchbridgeDocs.filter((d) => d.status === "approved").map((d) => d.type));

  const handleDownload = async (doc: DocRow) => {
    if (!doc.file_path) return;
    setDownloading(doc.id);
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 180);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-3"># Company files</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">Documents</h1>
        <p className="mt-2 text-sm text-text-2">
          All official documents prepared by LaunchBridge for your company. Download anytime.
        </p>
      </div>

      {/* Document checklist */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">Your company documents</h2>
        </div>

        {launchbridgeDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">Documents are being prepared</p>
            <p className="max-w-sm text-xs text-text-3">
              Our team is working on your formation documents. You'll receive a notification once they're ready to download.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {launchbridgeDocs.map((doc) => {
              const style = STATUS_STYLE[doc.status] ?? STATUS_STYLE.pending;
              const isReady = doc.status === "approved" && doc.file_path;
              const isLoading = downloading === doc.id;

              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg">
                      {TYPE_ICON[doc.type] ?? "📄"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {TYPE_LABEL[doc.type] ?? doc.name}
                      </p>
                      <p className="text-xs text-text-3">
                        {doc.name} · {new Date(doc.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>

                    {isReady ? (
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
                      >
                        {isLoading
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Download className="h-3.5 w-3.5" />}
                        Download
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-3">
                        <Lock className="h-3 w-3" /> Not ready
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Coming soon checklist — shows what to expect */}
      {launchbridgeDocs.length < CLIENT_DOWNLOAD_TYPES.length - 1 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-3 mb-4">Coming with your formation</h2>
          <ul className="space-y-2.5">
            {CLIENT_DOWNLOAD_TYPES.filter((t) => t !== "other").map((type) => {
              const isReady = readyTypes.has(type);
              return (
                <li key={type} className="flex items-center gap-3 text-sm">
                  <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    isReady ? "bg-emerald-500" : "border-2 border-border"
                  }`}>
                    {isReady && <span className="text-[10px] text-white font-bold">✓</span>}
                  </div>
                  <span className={isReady ? "font-semibold text-foreground" : "text-text-2"}>
                    {TYPE_LABEL[type]}
                  </span>
                  {isReady && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      Ready
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Footer help */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm shadow-soft">
        <div className="inline-flex items-center gap-2 text-text-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          All documents are securely stored and encrypted.
        </div>
        <Link
          to="/dashboard/support"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <Headphones className="h-4 w-4" />
          Questions about a document? Contact support
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
