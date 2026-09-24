import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminTeam";

export const Route = createFileRoute("/admin/team")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Team | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
