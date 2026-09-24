import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminOrders";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Orders | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
