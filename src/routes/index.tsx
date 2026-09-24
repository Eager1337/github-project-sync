import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haamkay Enterprises | Luxury Fashion & Retail in Freetown" },
      { name: "description", content: "Shop fashion, shoes, bags and accessories in Freetown, Sierra Leone. Prices in Leones, fast delivery, order on WhatsApp." },
      { property: "og:title", content: "Haamkay Enterprises | Luxury Fashion & Retail in Freetown" },
      { property: "og:description", content: "Shop fashion, shoes, bags and accessories in Freetown, Sierra Leone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
