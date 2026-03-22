import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Drug DB",
    short_name: "Drug DB",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
