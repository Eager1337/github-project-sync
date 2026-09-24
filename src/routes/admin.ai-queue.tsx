import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminAIQueue";

export const Route = createFileRoute("/admin/ai-queue")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Ai Queue | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
