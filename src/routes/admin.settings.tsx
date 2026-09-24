import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminSettings";

export const Route = createFileRoute("/admin/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Settings | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
