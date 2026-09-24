import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminLogin";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
