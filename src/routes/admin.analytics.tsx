import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Analytics | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
