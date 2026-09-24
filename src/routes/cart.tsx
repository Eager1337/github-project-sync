import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: 'Your Cart | Haamkay Enterprises' },
      { name: "description", content: 'Review your cart and place your order.' },
      { property: "og:title", content: 'Your Cart | Haamkay Enterprises' },
      { property: "og:description", content: 'Review your cart and place your order.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
