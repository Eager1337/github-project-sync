import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminPriceHistory";

export const Route = createFileRoute("/admin/price-history")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Price History | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
