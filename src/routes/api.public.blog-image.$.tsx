import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BUCKET = "blog-images";
const ROUTE_PREFIX = "/api/public/blog-image/";

export const Route = createFileRoute("/api/public/blog-image/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawPath = url.pathname.startsWith(ROUTE_PREFIX)
          ? url.pathname.slice(ROUTE_PREFIX.length)
          : "";
        const objectPath = rawPath
          .split("/")
          .filter(Boolean)
          .map((part) => decodeURIComponent(part))
          .join("/");

        if (!objectPath) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(objectPath);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});