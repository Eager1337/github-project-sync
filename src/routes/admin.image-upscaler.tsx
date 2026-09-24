import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminImageUpscaler";

export const Route = createFileRoute("/admin/image-upscaler")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Image Upscaler | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
