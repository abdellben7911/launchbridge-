import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/_authenticated/admin/blog/new")({
  component: () => <PostEditor mode="create" />,
});
