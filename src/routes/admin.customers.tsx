import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminCustomers";

export const Route = createFileRoute("/admin/customers")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Customers | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
