import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/OurStory";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: 'Our Story | Haamkay Enterprises' },
      { name: "description", content: 'The story behind Haamkay Enterprises in Freetown.' },
      { property: "og:title", content: 'Our Story | Haamkay Enterprises' },
      { property: "og:description", content: 'The story behind Haamkay Enterprises in Freetown.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
