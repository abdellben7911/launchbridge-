ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS og_image text;

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can read blog images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);