import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const sitemap = baseUrl ? new URL("/sitemap.xml", baseUrl).toString() : "/sitemap.xml";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap,
  };
}
