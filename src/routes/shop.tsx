import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Shop";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: 'Shop All Products | Haamkay Enterprises' },
      { name: "description", content: 'Browse fashion, shoes, bags and more at Haamkay Enterprises, Freetown.' },
      { property: "og:title", content: 'Shop All Products | Haamkay Enterprises' },
      { property: "og:description", content: 'Browse fashion, shoes, bags and more at Haamkay Enterprises, Freetown.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
