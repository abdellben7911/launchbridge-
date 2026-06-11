import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileText, Upload, X, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatusPill, type GatewayStatus } from "@/components/dashboard/shared";
import {
  uploadOrderDocument,
  getSignedDocUrl,
  DOC_TYPES,
  DOC_TYPE_LABEL,
  ACCEPT_MIME,
  MAX_FILE_BYTES,
  type DocType,
} from "@/lib/documents";

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

const REQUIRED_SLOTS: DocType[] = ["id_front", "id_back", "proof_address"];

function statusToPill(status: string): { s: GatewayStatus; label: string } {
  switch (status) {
    case "approved":
      return { s: "completed", label: "Approved" };
    case "rejected":
      return { s: "action_required", label: "Needs replacement" };
    case "pending":
    default:
      return { s: "pending_review", label: "Pending review" };
  }
}

function DocumentsPage() {
  const { user } = useAuth();
  const { order, documents, loading } = useDashboardData() as {
    order: { id: string } | null;
    documents: DocRow[];
    loading: boolean;
  };
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <h1 className="text-2xl font-extrabold">Documents</h1>
        <p className="mt-2 text-sm text-text-2">You don't have an active order yet. Start one from Services to upload documents.</p>
      </div>
    );
  }

  const orderId = order.id;
  const userId = user!.id;

  const docsByType = documents.reduce<Record<string, DocRow[]>>((acc, d) => {
    (acc[d.type] ??= []).push(d);
    return acc;
  }, {});

  const handleUpload = async (type: DocType | string, file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError(`${file.name} is larger than 10 MB.`);
      return;
    }
    setError(null);
    setBusy(`${type}-${file.name}`);
    try {
      await uploadOrderDocument({ orderId, userId, type, file });
    } catch (e) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  const openSigned = async (doc: DocRow) => {
    if (!doc.file_path) return;
    try {
      const url = await getSignedDocUrl(doc.file_path);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setError((e as Error).message ?? "Could not open file");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Documents</h1>
        <p className="mt-1 text-sm text-text-2">Upload your KYC documents. Our team reviews each file — you'll see live status updates here.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Required checklist */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">Required documents</h2>
        <div className="mt-4 grid gap-3">
          {REQUIRED_SLOTS.map((slot) => {
            const items = docsByType[slot] ?? [];
            const latest = items[0];
            const pill = latest
              ? statusToPill(latest.status)
              : { s: "action_required" as GatewayStatus, label: "Missing" };
            return (
              <SlotRow
                key={slot}
                label={DOC_TYPE_LABEL[slot] ?? slot}
                pill={pill}
                latest={latest}
                busy={busy?.startsWith(`${slot}-`) ?? false}
                onPick={(f) => handleUpload(slot, f)}
                onOpen={openSigned}
              />
            );
          })}
        </div>
      </section>

      {/* All documents */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">All uploads</h2>
          <span className="text-[11px] text-text-3">{documents.length} file{documents.length === 1 ? "" : "s"}</span>
        </div>
        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-text-2">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {documents.map((d) => {
              const pill = statusToPill(d.status);
              return (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{d.name}</div>
                      <div className="text-[11px] text-text-3">
                        {DOC_TYPE_LABEL[d.type] ?? d.type} · {new Date(d.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={pill.s} label={pill.label} />
                    {d.file_path && (
                      <button
                        type="button"
                        onClick={() => openSigned(d)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-text-2 hover:border-primary hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Add more */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">Upload additional document</h2>
        <p className="mt-1 text-xs text-text-3">Business proof, contracts, anything else useful (max 10 MB, PDF or image).</p>
        <div className="mt-3">
          <PickButton
            busy={busy === "extra"}
            onPick={async (f) => {
              setBusy("extra");
              try { await handleUpload("other", f); } finally { setBusy(null); }
            }}
          />
        </div>
      </section>
    </div>
  );
}

function SlotRow({
  label,
  pill,
  latest,
  busy,
  onPick,
  onOpen,
}: {
  label: string;
  pill: { s: GatewayStatus; label: string };
  latest?: DocRow;
  busy: boolean;
  onPick: (f: File) => void;
  onOpen: (d: DocRow) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-2 px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <div className="truncate font-semibold">{label}</div>
        {latest ? (
          <div className="truncate text-[11px] text-text-3">{latest.name} · {new Date(latest.created_at).toLocaleDateString()}</div>
        ) : (
          <div className="text-[11px] text-text-3">No file uploaded</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={pill.s} label={pill.label} />
        {latest?.file_path && (
          <button
            type="button"
            onClick={() => onOpen(latest)}
            className="rounded-full border border-border p-1.5 text-text-2 hover:border-primary hover:text-primary"
            title="View"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : latest ? <RefreshCw className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          {latest ? "Replace" : "Upload"}
        </button>
        <input
          ref={ref}
          type="file"
          accept={ACCEPT_MIME}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            if (ref.current) ref.current.value = "";
          }}
        />
      </div>
    </div>
  );
}

function PickButton({ busy, onPick }: { busy: boolean; onPick: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-5 text-xs font-medium transition disabled:opacity-50 ${
          drag ? "border-primary bg-primary/5 text-primary" : "border-border text-text-2 hover:border-primary/60 hover:text-primary"
        }`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Click or drop a file
      </button>
      <input
        ref={ref}
        type="file"
        accept={ACCEPT_MIME}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          if (ref.current) ref.current.value = "";
        }}
      />
    </>
  );
}

// Ensure DOC_TYPES is referenced so it survives tree-shaking analysis when imported elsewhere
void DOC_TYPES;
// Avoid unused-warning if ever stripped
void X;
