import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: 'Contact Us | Haamkay Enterprises' },
      { name: "description", content: 'Reach Haamkay on WhatsApp, phone or in store.' },
      { property: "og:title", content: 'Contact Us | Haamkay Enterprises' },
      { property: "og:description", content: 'Reach Haamkay on WhatsApp, phone or in store.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
