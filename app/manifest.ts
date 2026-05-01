import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KALION MAX",
    short_name: "Kalion Max",
    description: "Trainings-App für alle Sportarten — Plan, Tracking, Fortschritt.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f1218",
    theme_color: "#0f1218",
    lang: "de",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
