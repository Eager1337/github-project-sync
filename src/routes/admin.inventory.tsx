import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminInventory";

export const Route = createFileRoute("/admin/inventory")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Inventory | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
