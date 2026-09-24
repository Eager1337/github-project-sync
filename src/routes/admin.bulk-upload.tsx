import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminBulkUpload";

export const Route = createFileRoute("/admin/bulk-upload")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Bulk Upload | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
