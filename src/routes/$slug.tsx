import { createFileRoute, notFound } from "@tanstack/react-router";
import CategoryLanding from "@/components/seo/CategoryLanding";
import NotFound from "@/pages/NotFound";
import { landingConfigs } from "@/pages/landing/landingConfigs";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const config = landingConfigs.find((c) => c.slug === params.slug);
    if (!config) throw notFound();
    return { slug: config.slug };
  },
  head: ({ loaderData }) => {
    const c = landingConfigs.find((x) => x.slug === loaderData?.slug);
    if (!c) return {};
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Landing,
  notFoundComponent: NotFound,
});

function Landing() {
  const { slug } = Route.useLoaderData();
  const config = landingConfigs.find((c) => c.slug === slug)!;
  return <CategoryLanding config={config} />;
}
