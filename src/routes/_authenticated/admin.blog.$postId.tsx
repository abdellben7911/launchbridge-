import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPost } from "@/lib/blog.functions";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/_authenticated/admin/blog/$postId")({
  component: EditPost,
});

function EditPost() {
  const { postId } = Route.useParams();
  const get = useServerFn(adminGetPost);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog", "post", postId],
    queryFn: () => get({ data: { id: postId } }),
  });
  if (isLoading) return <div className="p-8 text-text-3">Loading…</div>;
  if (!data) return <div className="p-8 text-text-3">Post not found.</div>;
  return <PostEditor mode="edit" initial={data as any} />;
}
