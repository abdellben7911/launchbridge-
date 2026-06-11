import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { getRelatedPosts, type BlogPostListItem } from "@/lib/blog.functions";
import { useLang } from "@/i18n/LanguageProvider";

export function RelatedPosts({ postId, categoryId }: { postId: string; categoryId: string | null }) {
  const { lang, t } = useLang();
  const { data = [] } = useQuery({
    queryKey: ["blog", "related", postId],
    queryFn: () => getRelatedPosts({ data: { postId, categoryId: categoryId ?? undefined, limit: 3 } }),
  });

  if (!data.length) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-serif-display text-2xl font-bold tracking-tight md:text-3xl">
        {lang === "fr" ? "À lire ensuite" : lang === "ar" ? "اقرأ أيضاً" : "Read next"}
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p: BlogPostListItem) => {
          const title = lang === "fr" ? p.title_fr || p.title_en : lang === "ar" ? p.title_ar || p.title_en : p.title_en;
          const catName = p.category
            ? lang === "fr" ? p.category.name_fr : lang === "ar" ? p.category.name_ar : p.category.name_en
            : null;
          return (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-bg-2">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full" style={{ backgroundImage: "var(--gradient-hero)", opacity: 0.18 }} />
                )}
                {catName && (
                  <span className="absolute start-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                    {catName}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                  {title}
                </h3>
                <div className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-text-3">
                  <Clock className="h-3 w-3" />
                  {p.reading_minutes} {t("blog.minRead")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
