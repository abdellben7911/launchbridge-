
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable by all" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.blog_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_categories_updated BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  title_en text NOT NULL,
  title_fr text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  excerpt_fr text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_fr text NOT NULL DEFAULT '',
  body_ar text NOT NULL DEFAULT '',
  cover_url text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  reading_minutes int NOT NULL DEFAULT 5,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX blog_posts_status_pub_idx ON public.blog_posts (status, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category_id);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published posts readable by all" ON public.blog_posts FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "admins read all posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.blog_categories (slug, name_en, name_fr, name_ar) VALUES
  ('formation', 'Formation', 'Formation', 'التأسيس'),
  ('banking', 'Banking', 'Banque', 'البنوك'),
  ('growth', 'Growth', 'Croissance', 'النمو'),
  ('case-studies', 'Case studies', 'Études de cas', 'دراسات حالة')
ON CONFLICT DO NOTHING;
