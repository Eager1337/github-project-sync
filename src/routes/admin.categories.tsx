import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminCategories";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Categories | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
