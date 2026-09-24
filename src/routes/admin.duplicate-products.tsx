import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminDuplicateProducts";

export const Route = createFileRoute("/admin/duplicate-products")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Duplicate Products | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
