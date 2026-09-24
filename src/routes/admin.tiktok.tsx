import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminTikTok";

export const Route = createFileRoute("/admin/tiktok")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Tiktok | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
