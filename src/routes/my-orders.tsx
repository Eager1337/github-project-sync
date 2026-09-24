import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/MyOrders";

export const Route = createFileRoute("/my-orders")({
  head: () => ({
    meta: [
      { title: 'My Orders | Haamkay Enterprises' },
      { name: "description", content: 'Track your Haamkay orders.' },
      { property: "og:title", content: 'My Orders | Haamkay Enterprises' },
      { property: "og:description", content: 'Track your Haamkay orders.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
