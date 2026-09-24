import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AiShopper";

export const Route = createFileRoute("/ai-shopper")({
  head: () => ({
    meta: [
      { title: "AI Product Finder | Haamkay Enterprises" },
      { name: "description", content: "Describe what you need — our AI shopper finds the best products from Haamkay's live catalogue with explanations. Powered by AI Gateway." },
      { property: "og:title", content: "AI Product Finder | Haamkay Enterprises" },
      { property: "og:description", content: "Describe what you need — our AI shopper finds the best products with explanations. Prices in Leones, fast delivery in Freetown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
