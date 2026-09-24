import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: 'Wishlist | Haamkay Enterprises' },
      { name: "description", content: 'Items you saved for later.' },
      { property: "og:title", content: 'Wishlist | Haamkay Enterprises' },
      { property: "og:description", content: 'Items you saved for later.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
