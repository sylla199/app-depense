import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Désactivé : l'app est entièrement dynamique (session par cookie, lectures
  // Prisma par utilisateur sur presque chaque page) — "Cache Components"
  // exigerait un `"use cache"` ou un Suspense explicite sur chaque accès, ce
  // qui n'apporte rien ici.
  turbopack: {
    // Évite que Turbopack ne remonte jusqu'au dossier utilisateur (qui
    // contient un package-lock.json sans rapport) pour déterminer la racine
    // du projet.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
