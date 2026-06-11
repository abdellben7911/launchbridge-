import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import slugify from "slugify";
import { toast } from "sonner";
import { Bold, Code2, Heading2, Heading3, ImagePlus, Italic, LinkIcon, List, ListOrdered, Loader2, Quote, Save, Send, Sparkles, UnderlineIcon, Wand2, X, Languages } from "lucide-react";
import { adminUpsertPost, listCategories } from "@/lib/blog.functions";
import { aiGenerateArticle, aiGenerateSeo, aiRewriteText, aiTranslate } from "@/lib/ai-writer.functions";
import { uploadBlogImage } from "@/lib/blog-images";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Locale = "en" | "fr" | "ar";
type PostShape = {
  id?: string; slug: string; status: "draft" | "published";
  title_en: string; title_fr: string; title_ar: string;
  excerpt_en: string; excerpt_fr: string; excerpt_ar: string;
  body_en: string; body_fr: string; body_ar: string;
  cover_url: string | null; og_image: string | null; category_id: string | null;
  tags: string[]; reading_minutes: number; seo_title: string | null; seo_description: string | null; published_at: string | null;
};

const EMPTY: PostShape = {
  slug: "", status: "draft", title_en: "", title_fr: "", title_ar: "", excerpt_en: "", excerpt_fr: "", excerpt_ar: "",
  body_en: "", body_fr: "", body_ar: "", cover_url: null, og_image: null, category_id: null, tags: [], reading_minutes: 5,
  seo_title: null, seo_description: null, published_at: null,
};

const TONES = ["Professional", "Friendly", "Technical", "Casual"] as const;
type Tone = typeof TONES[number];

const isBlankHtml = (value: string) => value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;

export function PostEditor({ mode, initial }: { mode: "create" | "edit"; initial?: Partial<PostShape> }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertPost);
  const cats = useServerFn(listCategories);
  const genArticle = useServerFn(aiGenerateArticle);
  const rewrite = useServerFn(aiRewriteText);
  const translate = useServerFn(aiTranslate);
  const genSeo = useServerFn(aiGenerateSeo);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);
  const inlineImageRef = useRef<HTMLInputElement>(null);
  const [post, setPost] = useState<PostShape>({ ...EMPTY, ...initial, og_image: initial?.og_image ?? null });
  const [locale, setLocale] = useState<Locale>("en");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [seoOpen, setSeoOpen] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "og" | "inline" | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState<Tone>("Professional");
  const [aiBusy, setAiBusy] = useState<null | "generate" | "rewrite" | "translate" | "seo">(null);
  const { data: categories = [] } = useQuery({ queryKey: ["blog", "categories"], queryFn: () => cats() });

  const bodyKey = `body_${locale}` as const;
  const titleKey = `title_${locale}` as const;
  const excerptKey = `excerpt_${locale}` as const;
  const titleEnSlug = useMemo(() => slugify(post.title_en || "", { lower: true, strict: true }), [post.title_en]);
  const set = <K extends keyof PostShape>(k: K, v: PostShape[K]) => setPost((p) => ({ ...p, [k]: v }));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, LinkExtension.configure({ openOnClick: false }), ImageExtension],
    content: post[bodyKey] || "",
    editorProps: { attributes: { class: "prose-blog min-h-[420px] max-w-none rounded-b-xl bg-card px-4 py-4 outline-none" } },
    onUpdate: ({ editor }) => set(bodyKey, editor.getHTML() as PostShape[typeof bodyKey]),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== (post[bodyKey] || "")) editor.commands.setContent(post[bodyKey] || "", { emitUpdate: false });
  }, [bodyKey, editor]);

  const handleFile = async (file: File, target: "cover" | "og" | "inline") => {
    try {
      setUploading(target);
      const url = await uploadBlogImage(file);
      if (target === "cover") set("cover_url", url);
      if (target === "og") set("og_image", url);
      if (target === "inline") editor?.chain().focus().setImage({ src: url }).run();
      toast.success("Image uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Image upload failed");
    } finally {
      setUploading(null);
    }
  };

  // ---------- AI handlers ----------
  const runGenerate = async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic"); return; }
    if (!isBlankHtml(post[bodyKey]) && !confirm("This will replace the current title and content. Continue?")) return;
    try {
      setAiBusy("generate");
      const r = await genArticle({ data: { topic: aiTopic, keywords: aiKeywords, tone: aiTone, locale } });
      setPost((p) => ({ ...p, [titleKey]: r.title, [excerptKey]: r.excerpt, [bodyKey]: r.body_html } as PostShape));
      editor?.commands.setContent(r.body_html || "", { emitUpdate: false });
      if (locale === "en" && !slugTouched) set("slug", slugify(r.title, { lower: true, strict: true }));
      setAiDialogOpen(false);
      setAiTopic(""); setAiKeywords("");
      toast.success("Article drafted by AI");
    } catch (e: any) { toast.error(e?.message || "AI generation failed"); }
    finally { setAiBusy(null); }
  };

  const runRewrite = async (rewriteMode: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) { toast.error("Select some text first"); return; }
    const slice = editor.state.doc.cut(from, to);
    const tmp = document.createElement("div");
    // Serialize selection to HTML via the editor schema
    const html = editor.getHTML().slice(0); // fallback; we use plain text instead
    const text = editor.state.doc.textBetween(from, to, "\n");
    void html; void tmp;
    try {
      setAiBusy("rewrite");
      const r = await rewrite({ data: { text, mode: rewriteMode, tone: aiTone, locale } });
      editor.chain().focus().deleteRange({ from, to }).insertContent(r.text).run();
      toast.success("Rewritten");
    } catch (e: any) { toast.error(e?.message || "Rewrite failed"); }
    finally { setAiBusy(null); }
    void slice;
  };

  const runTranslate = async () => {
    if (!post.title_en.trim() || isBlankHtml(post.body_en)) { toast.error("Write English content first"); return; }
    try {
      setAiBusy("translate");
      const [fr, ar] = await Promise.all([
        translate({ data: { title_en: post.title_en, excerpt_en: post.excerpt_en, body_en: post.body_en, target: "fr" } }),
        translate({ data: { title_en: post.title_en, excerpt_en: post.excerpt_en, body_en: post.body_en, target: "ar" } }),
      ]);
      setPost((p) => ({
        ...p,
        title_fr: fr.title, excerpt_fr: fr.excerpt, body_fr: fr.body_html,
        title_ar: ar.title, excerpt_ar: ar.excerpt, body_ar: ar.body_html,
      }));
      if (locale !== "en") editor?.commands.setContent((locale === "fr" ? fr : ar).body_html || "", { emitUpdate: false });
      toast.success("Translated to FR and AR");
    } catch (e: any) { toast.error(e?.message || "Translation failed"); }
    finally { setAiBusy(null); }
  };

  const runSeo = async () => {
    try {
      setAiBusy("seo");
      const r = await genSeo({ data: { title: post[titleKey], body_html: post[bodyKey], locale } });
      setPost((p) => ({ ...p, seo_title: r.seo_title, seo_description: r.seo_description }));
      toast.success("SEO meta generated");
    } catch (e: any) { toast.error(e?.message || "SEO generation failed"); }
    finally { setAiBusy(null); }
  };

  const save = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      if (!post.title_en.trim()) throw new Error("English title is required");
      if (isBlankHtml(post.body_en)) throw new Error("English content is required");
      const fill = (v: string) => (v.trim() ? v : post.title_en);
      const fillBody = (v: string) => (!isBlankHtml(v) ? v : post.body_en);
      const excerpt = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
      return upsert({ data: { ...post, status, slug: post.slug || titleEnSlug, title_fr: fill(post.title_fr), title_ar: fill(post.title_ar), body_fr: fillBody(post.body_fr), body_ar: fillBody(post.body_ar), excerpt_en: post.excerpt_en || excerpt(post.body_en), excerpt_fr: post.excerpt_fr || excerpt(post.body_fr || post.body_en), excerpt_ar: post.excerpt_ar || excerpt(post.body_ar || post.body_en) } });
    },
    onSuccess: (row: any) => {
      toast.success("Post saved");
      qc.invalidateQueries({ queryKey: ["admin", "blog", "posts"] });
      qc.invalidateQueries({ queryKey: ["blog"] });
      if (mode === "create" && row?.id) navigate({ to: "/admin/blog/$postId", params: { postId: row.id } });
    },
    onError: (error: any) => toast.error(error?.message || "Save failed"),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold">{mode === "create" ? "New post" : "Edit post"}</h1><p className="text-sm text-text-3">/{post.slug || titleEnSlug || "new-post"}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/blog" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent"><X className="h-4 w-4" /> Cancel</Link>
          <button disabled={save.isPending} onClick={() => save.mutate("draft")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-60"><Save className="h-4 w-4" /> Save as Draft</button>
          <button disabled={save.isPending} onClick={() => save.mutate("published")} className="inline-flex items-center gap-2 rounded-lg bg-[var(--blog-publish)] px-4 py-2 text-sm font-bold text-white hover:shadow-elegant disabled:opacity-60"><Send className="h-4 w-4" /> Publish</button>
        </div>
      </header>

      {/* AI assistant bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary"><Sparkles className="h-4 w-4" /> AI assistant</span>
        <button onClick={() => setAiDialogOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"><Wand2 className="h-3.5 w-3.5" /> Generate article</button>
        <button onClick={runTranslate} disabled={aiBusy === "translate"} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent disabled:opacity-60">{aiBusy === "translate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />} Translate EN → FR & AR</button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-text-3">Tone</span>
          <select value={aiTone} onChange={(e) => setAiTone(e.target.value as Tone)} className="rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold">
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="flex w-fit rounded-xl border border-border bg-card p-1">{(["en", "fr", "ar"] as const).map((l) => <button key={l} onClick={() => setLocale(l)} className={`rounded-lg px-4 py-2 text-xs font-bold uppercase ${locale === l ? "bg-primary text-primary-foreground" : "text-text-2 hover:bg-accent"}`}>{l}</button>)}</div>

      <section className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <Field label="Title field (required)"><input value={post[titleKey]} onChange={(e) => { set(titleKey, e.target.value); if (locale === "en" && !slugTouched) set("slug", slugify(e.target.value, { lower: true, strict: true })); }} className="w-full rounded-lg border border-border bg-card px-3 py-3 text-lg font-bold" dir={locale === "ar" ? "rtl" : "ltr"} /></Field>
          <Field label="Content editor"><Toolbar editor={editor} onImage={() => inlineImageRef.current?.click()} onRewrite={runRewrite} rewriteBusy={aiBusy === "rewrite"} /><EditorContent editor={editor} dir={locale === "ar" ? "rtl" : "ltr"} className="rounded-xl border border-border bg-card" /><input ref={inlineImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "inline")} /></Field>
        </main>
        <aside className="space-y-4">
          <Field label="Slug"><input value={post.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value, { lower: true, strict: true })); }} className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm" /></Field>
          <Field label="Category"><select value={post.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"><option value="">Choose…</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</select></Field>
          <Field label="Status"><div className="grid grid-cols-2 rounded-lg border border-border bg-card p-1"><button onClick={() => set("status", "draft")} className={`rounded-md py-2 text-sm font-bold ${post.status === "draft" ? "bg-accent text-primary" : "text-text-2"}`}>Draft</button><button onClick={() => set("status", "published")} className={`rounded-md py-2 text-sm font-bold ${post.status === "published" ? "bg-[var(--blog-publish)] text-white" : "text-text-2"}`}>Published</button></div></Field>
          <ImageDrop label="Featured image upload" url={post.cover_url} busy={uploading === "cover"} inputRef={coverInputRef} onFile={(file) => handleFile(file, "cover")} />
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen} className="rounded-xl border border-border bg-card p-4">
            <CollapsibleTrigger className="w-full text-left text-xs font-bold uppercase tracking-wider text-text-3">SEO section {seoOpen ? "−" : "+"}</CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <button type="button" onClick={runSeo} disabled={aiBusy === "seo"} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-60">{aiBusy === "seo" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI auto-fill SEO</button>
              <Field label="Meta title"><input value={post.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value || null)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" /></Field>
              <Field label="Meta description"><textarea rows={3} value={post.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value || null)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" /></Field>
              <ImageDrop label="OG image" url={post.og_image} busy={uploading === "og"} inputRef={ogInputRef} onFile={(file) => handleFile(file, "og")} />
            </CollapsibleContent>
          </Collapsible>
        </aside>
      </section>

      {/* Generate article dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> Generate article with AI</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label={`Topic (writing in ${locale.toUpperCase()})`}>
              <textarea autoFocus rows={3} value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. How to open a business bank account in the UAE as a non-resident" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </Field>
            <Field label="Keywords (optional)">
              <input value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} placeholder="banking, UAE, non-resident, KYC" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </Field>
            <Field label="Tone">
              <select value={aiTone} onChange={(e) => setAiTone(e.target.value as Tone)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <DialogFooter>
            <button onClick={() => setAiDialogOpen(false)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">Cancel</button>
            <button onClick={runGenerate} disabled={aiBusy === "generate" || !aiTopic.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {aiBusy === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Toolbar({ editor, onImage, onRewrite, rewriteBusy }: { editor: any; onImage: () => void; onRewrite: (mode: string) => void; rewriteBusy: boolean }) {
  const addLink = () => { const url = prompt("Link URL"); if (url) editor?.chain().focus().setLink({ href: url }).run(); };
  const buttons = [
    [Bold, () => editor?.chain().focus().toggleBold().run()], [Italic, () => editor?.chain().focus().toggleItalic().run()], [UnderlineIcon, () => editor?.chain().focus().toggleUnderline().run()],
    [Heading2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run()], [Heading3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run()], [List, () => editor?.chain().focus().toggleBulletList().run()],
    [ListOrdered, () => editor?.chain().focus().toggleOrderedList().run()], [LinkIcon, addLink], [ImagePlus, onImage], [Code2, () => editor?.chain().focus().toggleCodeBlock().run()], [Quote, () => editor?.chain().focus().toggleBlockquote().run()],
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-border bg-bg-2 p-2">
      {buttons.map(([Icon, fn], i) => <button key={i} type="button" onClick={fn} className="rounded-md p-2 text-text-2 hover:bg-card hover:text-primary" title="Editor tool"><Icon className="h-4 w-4" /></button>)}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" disabled={rewriteBusy} className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-60" title="AI rewrite selected text">
              {rewriteBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI rewrite
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRewrite("improve")}>Improve writing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRewrite("shorten")}>Make shorter</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRewrite("expand")}>Expand</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRewrite("fix-grammar")}>Fix grammar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRewrite("change-tone")}>Change tone</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ImageDrop({ label, url, busy, inputRef, onFile }: { label: string; url: string | null; busy: boolean; inputRef: RefObject<HTMLInputElement | null>; onFile: (file: File) => void }) {
  return <Field label={label}><button type="button" onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) onFile(file); }} onDragOver={(e) => e.preventDefault()} className="w-full rounded-xl border border-dashed border-border bg-card p-4 text-center text-sm text-text-3 hover:border-primary/50">{url ? <img src={url} alt="" className="mx-auto aspect-video w-full rounded-lg object-cover" /> : busy ? "Uploading…" : "Drag & drop image, or click to upload"}</button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} /></Field>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-3">{label}</span>{children}</label>;
}
