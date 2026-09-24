import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminScheduledAlerts";

export const Route = createFileRoute("/admin/scheduled-alerts")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Scheduled Alerts | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
