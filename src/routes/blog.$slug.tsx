import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublishedPost, type BlogPostFull } from "@/lib/blog.functions";
import { useLang } from "@/i18n/LanguageProvider";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import { BookCallBanner } from "@/components/sections/BookCallBanner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShareBar } from "@/components/blog/ShareBar";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData({
      queryKey: ["blog", "post", params.slug],
      queryFn: () => getPublishedPost({ data: { slug: params.slug } }),
    });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const p = loaderData as BlogPostFull | undefined;
    if (!p) return { meta: [{ title: "Article — LaunchBridge" }] };
    const title = p.seo_title || p.title_en;
    const desc = p.seo_description || p.excerpt_en;
    return {
      meta: [
        { title: `${title} — LaunchBridge` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(p.cover_url ? [
          { property: "og:image", content: p.cover_url },
          { name: "twitter:image", content: p.cover_url },
        ] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-serif-display text-4xl">404</h1>
      <p className="mt-3 text-text-2">Article not found.</p>
      <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center text-destructive">
      {String((error as Error).message)}
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { lang, t } = useLang();
  const { data: post } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => getPublishedPost({ data: { slug } }),
  });
  if (!post) return null;

  const title = lang === "fr" ? post.title_fr || post.title_en : lang === "ar" ? post.title_ar || post.title_en : post.title_en;
  const body = lang === "fr" ? post.body_fr || post.body_en : lang === "ar" ? post.body_ar || post.body_en : post.body_en;
  const catName = post.category
    ? lang === "fr" ? post.category.name_fr : lang === "ar" ? post.category.name_ar : post.category.name_en
    : null;
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  return (
    <article className="mx-auto max-w-3xl px-6 pt-24 pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-text-3">
        <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
        <ChevronRight className="h-3 w-3 rtl-flip opacity-60" />
        <Link to="/blog" search={{}} className="hover:text-primary">{t("blog.tag")}</Link>
        {catName && (<>
          <ChevronRight className="h-3 w-3 rtl-flip opacity-60" />
          <span className="text-text-2">{catName}</span>
        </>)}
      </nav>

      <h1 className="mt-5 font-serif-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-y-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-3">
          {dateStr && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {dateStr}</span>}
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {post.reading_minutes} {t("blog.minRead")}</span>
          {post.author?.full_name && <span>· {post.author.full_name}</span>}
        </div>
        <ShareBar title={title} />
      </div>

      {post.cover_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <img src={post.cover_url} alt="" className="w-full" />
        </div>
      )}

      {body.trim().startsWith("<") ? (
        <div className="prose-blog mt-10" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="prose-blog mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map((tg) => (
            <span key={tg} className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-text-2">#{tg}</span>
          ))}
        </div>
      )}

      <BookCallBanner />


      <RelatedPosts postId={post.id} categoryId={post.category_id} />

      <div className="mt-12 border-t border-border pt-8 flex flex-wrap items-center justify-between gap-4">
        <Link to="/blog" search={{}} className="text-sm font-semibold text-primary hover:underline">
          ← {t("blog.backToAll")}
        </Link>
        <div className="flex items-center gap-2 text-xs text-text-3">
          <span>{lang === "fr" ? "Partager :" : lang === "ar" ? "شارك:" : "Share:"}</span>
          <ShareBar title={title} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `https://launchbridgepro.com/blog/${post.slug}#article`,
              headline: title,
              name: title,
              description: post.seo_description || post.excerpt_en,
              datePublished: post.published_at,
              dateModified: post.published_at,
              url: `https://launchbridgepro.com/blog/${post.slug}`,
              inLanguage: "en",
              author: {
                "@type": "Organization",
                "@id": "https://launchbridgepro.com/#organization",
                name: "LaunchBridge",
              },
              publisher: {
                "@type": "Organization",
                "@id": "https://launchbridgepro.com/#organization",
                name: "LaunchBridge",
                logo: {
                  "@type": "ImageObject",
                  url: "https://launchbridgepro.com/favicon.svg",
                },
              },
              ...(post.cover_url ? {
                image: {
                  "@type": "ImageObject",
                  url: post.cover_url,
                  width: 1200,
                  height: 750,
                },
              } : {}),
              ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
              timeRequired: `PT${post.reading_minutes}M`,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://launchbridgepro.com/blog/${post.slug}`,
              },
              isPartOf: {
                "@type": "Blog",
                "@id": "https://launchbridgepro.com/blog",
                name: "LaunchBridge Blog",
                publisher: { "@id": "https://launchbridgepro.com/#organization" },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://launchbridgepro.com" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://launchbridgepro.com/blog" },
                { "@type": "ListItem", position: 3, name: title, item: `https://launchbridgepro.com/blog/${post.slug}` },
              ],
            },
          ],
        })}}
      />
    </article>
  );
}
