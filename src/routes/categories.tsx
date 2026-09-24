import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: 'Shop by Category | Haamkay Enterprises' },
      { name: "description", content: 'Explore every Haamkay category.' },
      { property: "og:title", content: 'Shop by Category | Haamkay Enterprises' },
      { property: "og:description", content: 'Explore every Haamkay category.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
