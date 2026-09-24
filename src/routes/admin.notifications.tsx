import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminNotifications";

export const Route = createFileRoute("/admin/notifications")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Notifications | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
