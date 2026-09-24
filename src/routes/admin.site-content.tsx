import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminSiteContent";

export const Route = createFileRoute("/admin/site-content")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Site Content | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
