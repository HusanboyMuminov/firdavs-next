import type { MetadataRoute } from "next";
import { restaurant } from "@/data/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${restaurant.name} — Halal Uzbek Cuisine`,
    short_name: "FIRDAVS",
    description: `${restaurant.name}: halal Uzbek cuisine in Jeonju.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#4a0d18",
    icons: [
      { src: "/icons/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  };
}
