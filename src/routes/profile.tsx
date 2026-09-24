import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: 'My Profile | Haamkay Enterprises' },
      { name: "description", content: 'Your Haamkay profile.' },
      { property: "og:title", content: 'My Profile | Haamkay Enterprises' },
      { property: "og:description", content: 'Your Haamkay profile.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
