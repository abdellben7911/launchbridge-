import { supabase } from "@/integrations/supabase/client";
import {
  type DocType,
  MAX_FILE_BYTES,
  ALLOWED_MIME_TYPES,
  DOC_TYPE_LABEL,
  uploadOrderDocumentFn,
  clientValidateDocuments,
} from "@/lib/documents.functions";

export type { DocType };
export { MAX_FILE_BYTES, ALLOWED_MIME_TYPES, DOC_TYPE_LABEL, clientValidateDocuments, uploadOrderDocumentFn };

export const DOC_TYPES: { key: DocType; label: string; helper: string }[] = [
  { key: "id_front", label: "ID document — front", helper: "Passport page or national ID front" },
  { key: "id_back", label: "ID document — back", helper: "Required for national ID" },
  { key: "proof_address", label: "Proof of address", helper: "Utility bill, bank statement (< 3 months)" },
  { key: "business_proof", label: "Business proof", helper: "Existing registration, website, contracts" },
  { key: "other", label: "Other supporting document", helper: "Anything else useful for KYC" },
];

export const ACCEPT_MIME = "image/*,application/pdf";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
}

/** Client-side convenience wrapper around the server function. */
export async function uploadOrderDocument(params: {
  orderId: string;
  userId: string;
  type: DocType | string;
  file: File;
  idType?: string;
}) {
  const { orderId, type, file, idType } = params;
  const formData = new FormData();
  formData.append("orderId", orderId);
  formData.append("type", type);
  formData.append("file", file);
  if (idType) formData.append("idType", idType);
  return uploadOrderDocumentFn({ data: formData as unknown as Record<string, unknown> });
}

export async function getSignedDocUrl(filePath: string, expiresIn = 300) {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
