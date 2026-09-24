import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/DailyDrops";

export const Route = createFileRoute("/daily-drops")({
  head: () => ({
    meta: [
      { title: 'Daily Drops | Haamkay Enterprises' },
      { name: "description", content: 'Fresh products added every day.' },
      { property: "og:title", content: 'Daily Drops | Haamkay Enterprises' },
      { property: "og:description", content: 'Fresh products added every day.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
