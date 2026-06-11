import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

async function callGateway(messages: Array<{ role: string; content: string }>, jsonSchema?: any) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const body: any = { model: MODEL, messages };
  if (jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "result", strict: true, schema: jsonSchema },
    };
  }
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "raw-fetch",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("AI is rate limited. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}

function parseJson(content: string): any {
  try { return JSON.parse(content); } catch {}
  // strip code fences
  const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  // first {...} block
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(content.slice(start, end + 1)); } catch {}
  }
  throw new Error("AI returned invalid JSON");
}

const LANG_NAMES: Record<string, string> = { en: "English", fr: "French", ar: "Arabic" };

// ---------- Generate full article ----------
export const aiGenerateArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; keywords?: string; tone?: string; locale: "en" | "fr" | "ar" }) => ({
    topic: String(d.topic ?? "").trim(),
    keywords: String(d.keywords ?? "").trim(),
    tone: String(d.tone ?? "Professional"),
    locale: (["en", "fr", "ar"].includes(d.locale) ? d.locale : "en") as "en" | "fr" | "ar",
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.topic) throw new Error("Topic is required");
    const lang = LANG_NAMES[data.locale];
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        excerpt: { type: "string" },
        body_html: { type: "string" },
      },
      required: ["title", "excerpt", "body_html"],
    };
    const sys = `You are an expert blog writer. Write in ${lang}. Tone: ${data.tone}. Return well-structured HTML for the body using only these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a>. No <html>/<body>/<head>. No inline styles. Aim for 600-900 words, multiple sections with h2 headings.`;
    const user = `Topic: ${data.topic}${data.keywords ? `\nKeywords: ${data.keywords}` : ""}\n\nWrite a complete article. Return JSON with: title (catchy, <=70 chars), excerpt (1-2 sentences, <=180 chars), body_html (the article HTML).`;
    const content = await callGateway([{ role: "system", content: sys }, { role: "user", content: user }], schema);
    const out = parseJson(content);
    return { title: String(out.title || ""), excerpt: String(out.excerpt || ""), body_html: String(out.body_html || "") };
  });

// ---------- Rewrite selection ----------
export const aiRewriteText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; mode: string; tone?: string; locale: "en" | "fr" | "ar" }) => ({
    text: String(d.text ?? ""),
    mode: String(d.mode ?? "improve"),
    tone: String(d.tone ?? "Professional"),
    locale: (["en", "fr", "ar"].includes(d.locale) ? d.locale : "en") as "en" | "fr" | "ar",
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.text.trim()) throw new Error("No text to rewrite");
    const lang = LANG_NAMES[data.locale];
    const instructions: Record<string, string> = {
      improve: "Improve clarity, flow, and word choice while keeping meaning and length similar.",
      shorten: "Make it more concise. Cut filler. Aim for ~50% length.",
      expand: "Expand with more detail, examples, and depth. Roughly double the length.",
      "fix-grammar": "Fix grammar, spelling, and punctuation. Preserve voice and meaning.",
      "change-tone": `Rewrite in a ${data.tone} tone.`,
    };
    const instr = instructions[data.mode] || instructions.improve;
    const sys = `You rewrite text. Write in ${lang}. Preserve any HTML tags present in the input. Return ONLY the rewritten text/HTML — no preface, no explanation, no code fences.`;
    const user = `${instr}\n\nInput:\n${data.text}`;
    const content = await callGateway([{ role: "system", content: sys }, { role: "user", content: user }]);
    return { text: content.replace(/^```(?:html)?\s*|\s*```$/g, "").trim() };
  });

// ---------- Translate EN -> target ----------
export const aiTranslate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title_en: string; excerpt_en: string; body_en: string; target: "fr" | "ar" }) => ({
    title_en: String(d.title_en ?? ""),
    excerpt_en: String(d.excerpt_en ?? ""),
    body_en: String(d.body_en ?? ""),
    target: (d.target === "ar" ? "ar" : "fr") as "fr" | "ar",
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.title_en.trim() && !data.body_en.trim()) throw new Error("Nothing to translate");
    const lang = LANG_NAMES[data.target];
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: { title: { type: "string" }, excerpt: { type: "string" }, body_html: { type: "string" } },
      required: ["title", "excerpt", "body_html"],
    };
    const sys = `You are a professional translator. Translate the provided fields into ${lang}. Preserve all HTML tags and structure exactly. Do NOT add or remove tags. Keep proper nouns. Return JSON.`;
    const user = `Title: ${data.title_en}\n\nExcerpt: ${data.excerpt_en}\n\nBody HTML:\n${data.body_en}`;
    const content = await callGateway([{ role: "system", content: sys }, { role: "user", content: user }], schema);
    const out = parseJson(content);
    return { title: String(out.title || ""), excerpt: String(out.excerpt || ""), body_html: String(out.body_html || "") };
  });

// ---------- SEO meta ----------
export const aiGenerateSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; body_html: string; locale: "en" | "fr" | "ar" }) => ({
    title: String(d.title ?? ""),
    body_html: String(d.body_html ?? ""),
    locale: (["en", "fr", "ar"].includes(d.locale) ? d.locale : "en") as "en" | "fr" | "ar",
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.title.trim() && !data.body_html.trim()) throw new Error("Provide a title or content first");
    const lang = LANG_NAMES[data.locale];
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: { seo_title: { type: "string" }, seo_description: { type: "string" } },
      required: ["seo_title", "seo_description"],
    };
    const sys = `You write SEO metadata in ${lang}. seo_title <= 60 chars, includes the main keyword. seo_description <= 160 chars, compelling, includes the main keyword. Return JSON.`;
    const plain = data.body_html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);
    const user = `Title: ${data.title}\n\nContent: ${plain}`;
    const content = await callGateway([{ role: "system", content: sys }, { role: "user", content: user }], schema);
    const out = parseJson(content);
    return {
      seo_title: String(out.seo_title || "").slice(0, 70),
      seo_description: String(out.seo_description || "").slice(0, 180),
    };
  });
