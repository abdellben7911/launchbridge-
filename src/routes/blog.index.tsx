import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPosts, listCategories, type BlogPostListItem } from "@/lib/blog.functions";
import { PageHero } from "@/components/sections/PageHero";
import { useLang } from "@/i18n/LanguageProvider";
import { Clock, ArrowRight } from "lucide-react";

type Search = { category?: string };

export const Route = createFileRoute("/blog/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Blog — LaunchBridge" },
      { name: "description", content: "Insights on US LLC formation, banking, and growing international businesses from MEA." },
      { property: "og:title", content: "Blog — LaunchBridge" },
      { property: "og:description", content: "Operator-grade essays on formation, banking, and growth." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData({
      queryKey: ["blog", "posts", null],
      queryFn: () => listPublishedPosts({ data: {} }),
    });
    context.queryClient.ensureQueryData({
      queryKey: ["blog", "categories"],
      queryFn: () => listCategories(),
    });
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { lang, t } = useLang();
  const { category } = useSearch({ from: "/blog/" });

  const { data: posts = [] } = useQuery({
    queryKey: ["blog", "posts", category ?? null],
    queryFn: () => listPublishedPosts({ data: { category } }),
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["blog", "categories"],
    queryFn: () => listCategories(),
  });

  return (
    <>
      <PageHero tagKey="blog.tag" titleKey="blog.title" subtitleKey="blog.subtitle" />
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Link
            to="/blog"
            search={{}}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              !category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-text-2 hover:border-primary/40"
            }`}
          >
            {t("blog.all")}
          </Link>
          {cats.map((c) => {
            const name = lang === "fr" ? c.name_fr : lang === "ar" ? c.name_ar : c.name_en;
            const active = category === c.slug;
            return (
              <Link
                key={c.id}
                to="/blog"
                search={{ category: c.slug }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-text-2 hover:border-primary/40"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-text-3">
            {t("blog.empty")}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </>
  );
}

function PostCard({ post }: { post: BlogPostListItem }) {
  const { lang, t } = useLang();
  const title = lang === "fr" ? post.title_fr || post.title_en : lang === "ar" ? post.title_ar || post.title_en : post.title_en;
  const excerpt = lang === "fr" ? post.excerpt_fr || post.excerpt_en : lang === "ar" ? post.excerpt_ar || post.excerpt_en : post.excerpt_en;
  const catName = post.category
    ? lang === "fr" ? post.category.name_fr : lang === "ar" ? post.category.name_ar : post.category.name_en
    : null;

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-2">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ backgroundImage: "var(--gradient-hero)", opacity: 0.18 }}
          />
        )}
        {catName && (
          <span className="absolute start-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
            {catName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
          {title}
        </h3>
        {excerpt && <p className="mt-2 line-clamp-3 text-sm text-text-2">{excerpt}</p>}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-text-3">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {post.reading_minutes} {t("blog.minRead")}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            {t("blog.read")} <ArrowRight className="h-3 w-3 rtl-flip" />
          </span>
        </div>
      </div>
    </Link>
  );
}
