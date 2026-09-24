import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminProducts";

export const Route = createFileRoute("/admin/products")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Products | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
