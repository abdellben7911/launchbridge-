import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BlogPostListItem = {
  id: string;
  slug: string;
  title_en: string; title_fr: string; title_ar: string;
  excerpt_en: string; excerpt_fr: string; excerpt_ar: string;
  cover_url: string | null;
  category_id: string | null;
  category: { slug: string; name_en: string; name_fr: string; name_ar: string } | null;
  tags: string[];
  reading_minutes: number;
  og_image: string | null;
  published_at: string | null;
};

export type BlogPostFull = BlogPostListItem & {
  body_en: string; body_fr: string; body_ar: string;
  seo_title: string | null;
  seo_description: string | null;
  author?: { full_name: string | null; avatar_url: string | null } | null;
};

const PUBLIC_FIELDS =
  "id, slug, title_en, title_fr, title_ar, excerpt_en, excerpt_fr, excerpt_ar, cover_url, og_image, tags, reading_minutes, published_at, category_id, " +
  "category:blog_categories(slug, name_en, name_fr, name_ar)";

const FULL_FIELDS = PUBLIC_FIELDS +
  ", body_en, body_fr, body_ar, seo_title, seo_description";

/** Public — list published posts. Uses supabaseAdmin to safely project published columns from SSR. */
export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; limit?: number } = {}) => ({
    category: d.category,
    limit: Math.min(d.limit ?? 30, 50),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("blog_posts")
      .select(PUBLIC_FIELDS)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.category) {
      const { data: cat } = await supabaseAdmin
        .from("blog_categories")
        .select("id")
        .eq("slug", data.category)
        .maybeSingle();
      if (cat?.id) q = q.eq("category_id", cat.id);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return (rows ?? []) as unknown as BlogPostListItem[];
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("blog_categories")
    .select("id, slug, name_en, name_fr, name_ar")
    .order("name_en");
  if (error) throw error;
  return data ?? [];
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .select(FULL_FIELDS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return (row ?? null) as unknown as BlogPostFull | null;
  });

/** Public — related posts by category, falling back to newest published. */
export const getRelatedPosts = createServerFn({ method: "GET" })
  .inputValidator((d: { postId: string; categoryId?: string; limit?: number }) => ({
    postId: String(d.postId),
    categoryId: d.categoryId,
    limit: Math.min(d.limit ?? 3, 6),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = supabaseAdmin
      .from("blog_posts")
      .select(PUBLIC_FIELDS)
      .eq("status", "published")
      .neq("id", data.postId)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (data.categoryId) {
      const { data: rowsRaw, error: e1 } = await base.eq("category_id", data.categoryId);
      if (e1) return [];
      const rows = (rowsRaw ?? []) as unknown as BlogPostListItem[];
      if (rows.length >= data.limit) return rows;
      const need = data.limit - rows.length;
      const excludeIds = [data.postId, ...rows.map((r) => r.id)];
      const { data: extrasRaw } = await supabaseAdmin
        .from("blog_posts")
        .select(PUBLIC_FIELDS)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .not("id", "in", `(${excludeIds.join(",")})`)
        .order("published_at", { ascending: false })
        .limit(need);
      const extras = (extrasRaw ?? []) as unknown as BlogPostListItem[];
      return [...rows, ...extras];
    }

    const { data: rows, error } = await base;
    if (error) return [];
    return (rows ?? []) as unknown as BlogPostListItem[];
  });


// ---------- Admin (auth) ----------

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("id, slug, status, title_en, published_at, updated_at, category:blog_categories(slug, name_en)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

type UpsertInput = {
  id?: string;
  slug: string;
  status: "draft" | "published";
  title_en: string; title_fr: string; title_ar: string;
  excerpt_en: string; excerpt_fr: string; excerpt_ar: string;
  body_en: string; body_fr: string; body_ar: string;
  cover_url: string | null;
  category_id: string | null;
  tags: string[];
  reading_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  published_at: string | null;
};

export const adminUpsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: UpsertInput) => d)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      author_id: context.userId,
      updated_at: new Date().toISOString(),
      published_at:
        data.status === "published"
          ? data.published_at ?? new Date().toISOString()
          : data.published_at,
    };
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", data.id)
        .select("id, slug")
        .single();
      if (error) throw error;
      return row;
    }
    const { id: _ignored, ...insertPayload } = payload as typeof payload & { id?: string };
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .insert(insertPayload)
      .select("id, slug")
      .single();
    if (error) throw error;
    return row;
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
