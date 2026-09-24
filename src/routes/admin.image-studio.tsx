import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminImageStudio";

export const Route = createFileRoute("/admin/image-studio")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Image Studio | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
