import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminCsvImport";

export const Route = createFileRoute("/admin/csv-import")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Csv Import | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
