import { supabase } from "@/integrations/supabase/client";

export const BLOG_IMAGES_BUCKET = "blog-images";

export function toBlogImageUrl(path: string) {
  return `/api/public/blog-image/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadBlogImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in to upload images.");

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";
  const path = `${userData.user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  return toBlogImageUrl(path);
}