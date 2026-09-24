import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AdminAIListing";

export const Route = createFileRoute("/admin/ai-listing")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Ai Listing | Haamkay" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
