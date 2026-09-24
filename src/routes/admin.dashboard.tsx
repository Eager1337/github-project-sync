import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Dashboard | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
