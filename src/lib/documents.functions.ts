import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type DocType = "id_front" | "id_back" | "proof_address" | "business_proof" | "other";

export const DOC_TYPES: { key: DocType; label: string; helper: string }[] = [
  { key: "id_front", label: "ID document — front", helper: "Passport page or national ID front" },
  { key: "id_back", label: "ID document — back", helper: "Required for national ID" },
  { key: "proof_address", label: "Proof of address", helper: "Utility bill, bank statement (< 3 months)" },
  { key: "business_proof", label: "Business proof", helper: "Existing registration, website, contracts" },
  { key: "other", label: "Other supporting document", helper: "Anything else useful for KYC" },
];

export const DOC_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  DOC_TYPES.map((d) => [d.key, d.label]),
);

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
export const ACCEPT_MIME = "image/*,application/pdf";

const DOC_SLOT_RULES: Record<
  DocType,
  { required: boolean; conditionalRequired?: (ctx: { idType: string }) => boolean; allowedMime: string[] }
> = {
  id_front: {
    required: true,
    allowedMime: ALLOWED_MIME_TYPES,
  },
  id_back: {
    required: false,
    conditionalRequired: (ctx) => ctx.idType !== "passport",
    allowedMime: ALLOWED_MIME_TYPES,
  },
  proof_address: {
    required: false,
    allowedMime: ALLOWED_MIME_TYPES,
  },
  business_proof: {
    required: false,
    allowedMime: ALLOWED_MIME_TYPES,
  },
  other: {
    required: false,
    allowedMime: ALLOWED_MIME_TYPES,
  },
};

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
}

function validateDocumentSlot(params: {
  type: DocType;
  file: File;
  idType?: string;
}): { ok: true } | { ok: false; errors: string[] } {
  const { type, file, idType } = params;
  const rule = DOC_SLOT_RULES[type];
  const errors: string[] = [];

  if (!rule) {
    errors.push(`Unknown document type: ${type}`);
    return { ok: false, errors };
  }

  const isRequired = rule.required || (rule.conditionalRequired ? rule.conditionalRequired({ idType: idType ?? "" }) : false);

  if (isRequired && (!file || file.size === 0)) {
    errors.push(`${DOC_TYPE_LABEL[type]} is required.`);
  }

  if (file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name} exceeds the maximum size of 10 MB.`);
    }
    const normalizedMime = file.type?.toLowerCase().trim() || "";
    const isAllowed = rule.allowedMime.some((m) => normalizedMime === m) ||
      (normalizedMime.startsWith("image/") && rule.allowedMime.some((m) => m.startsWith("image/")));
    if (!isAllowed) {
      errors.push(
        `${file.name} has an unsupported type (${file.type || "unknown"}). Allowed: JPEG, PNG, WebP, GIF, PDF.`
      );
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export const uploadOrderDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => {
    if (!(raw instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const orderId = z.string().uuid().parse(raw.get("orderId"));
    const type = z.enum(["id_front", "id_back", "proof_address", "business_proof", "other"] as const).parse(raw.get("type"));
    const idType = z.string().optional().parse(raw.get("idType") ?? undefined);
    const file = raw.get("file");
    if (!(file instanceof File)) {
      throw new Error("Missing or invalid file");
    }
    return { orderId, type, idType, file };
  })
  .handler(async ({ data, context }) => {
    const { orderId, type, idType, file } = data;
    const { supabase, userId } = context;

    const validation = validateDocumentSlot({ type, file, idType });
    if (!validation.ok) {
      return { success: false as const, errors: validation.errors };
    }

    const path = `${userId}/${orderId}/${type}-${Date.now()}-${safeName(file.name)}`;
    const up = await supabase.storage.from("documents").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (up.error) {
      return { success: false as const, errors: [up.error.message] };
    }

    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        order_id: orderId,
        uploaded_by: userId,
        name: file.name,
        type,
        direction: "client_upload",
        status: "pending",
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null,
      })
      .select("id, name, type, direction, status, file_path, created_at")
      .single();
    if (error) {
      return { success: false as const, errors: [error.message] };
    }

    return { success: true as const, document: row };
  });

export const getSignedDocUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { filePath: string }) =>
    z.object({ filePath: z.string().min(1) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: signed, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(data.filePath, 300);
    if (error) throw error;
    return { signedUrl: signed.signedUrl };
  });

export async function clientValidateDocuments(params: {
  docs: Partial<Record<DocType, File>>;
  extraDocs: File[];
  idType: string;
}): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  const { docs, extraDocs, idType } = params;
  const errors: string[] = [];

  for (const type of Object.keys(DOC_SLOT_RULES) as DocType[]) {
    const file = docs[type];
    const result = validateDocumentSlot({ type, file: file ?? new File([], ""), idType });
    if (!result.ok) errors.push(...result.errors);
  }

  for (const file of extraDocs) {
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name} exceeds the maximum size of 10 MB.`);
    }
    const normalizedMime = file.type?.toLowerCase().trim() || "";
    const isAllowed = ALLOWED_MIME_TYPES.some((m) => normalizedMime === m) ||
      (normalizedMime.startsWith("image/") && ALLOWED_MIME_TYPES.some((m) => m.startsWith("image/")));
    if (!isAllowed) {
      errors.push(`${file.name} has unsupported type (${file.type || "unknown"}). Allowed: JPEG, PNG, WebP, GIF, PDF.`);
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
