import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Trending";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: 'Trending Now | Haamkay Enterprises' },
      { name: "description", content: 'The most wanted pieces at Haamkay.' },
      { property: "og:title", content: 'Trending Now | Haamkay Enterprises' },
      { property: "og:description", content: 'The most wanted pieces at Haamkay.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
