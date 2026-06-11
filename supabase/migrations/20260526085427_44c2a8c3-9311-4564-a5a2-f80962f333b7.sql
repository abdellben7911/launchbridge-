
-- 1) Make avatars bucket private so storage RLS is enforced on reads
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Tighten the SELECT policy: remove anon access; only owner and staff can read
DROP POLICY IF EXISTS "users list own avatars" ON storage.objects;
CREATE POLICY "users read own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_staff(auth.uid())
  )
);

-- 2) Remove tables from realtime publication (realtime is not used in app code)
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
ALTER PUBLICATION supabase_realtime DROP TABLE public.order_timeline;
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
