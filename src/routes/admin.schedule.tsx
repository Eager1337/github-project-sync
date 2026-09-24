import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminSchedule";

export const Route = createFileRoute("/admin/schedule")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Schedule | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
