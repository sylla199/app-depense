import type { MetadataRoute } from "next";

/**
 * Manifeste PWA — paramètres exacts de la section "PWA, SEO, légal et
 * partage" du handoff. Next.js sert ceci sur /manifest.webmanifest et
 * ajoute le <link rel="manifest"> tout seul.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gérer mes dépenses",
    short_name: "Dépenses",
    description: "Budget mensuel en FCFA : revenus, catégories, épargne et projets d'achat.",
    start_url: "/mois",
    display: "standalone",
    lang: "fr",
    theme_color: "#1F2557",
    background_color: "#1F2557",
    icons: [
      { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
