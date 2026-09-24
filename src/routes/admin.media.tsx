import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminMedia";

export const Route = createFileRoute("/admin/media")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Media | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
