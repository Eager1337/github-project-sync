import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/ProductDetail";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: 'Product | Haamkay Enterprises' },
      { name: "description", content: 'View product details, sizes, colours and price in Leones.' },
      { property: "og:title", content: 'Product | Haamkay Enterprises' },
      { property: "og:description", content: 'View product details, sizes, colours and price in Leones.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
