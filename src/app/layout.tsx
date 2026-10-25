import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Gérer mes dépenses",
  description: "Budget mensuel en FCFA : revenus, catégories, épargne et projets d'achat.",
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Dépenses",
    statusBarStyle: "black-translucent",
  },
};

// --band-deep, couleur de thème du manifeste PWA (section "PWA, SEO, légal
// et partage" du handoff) — fixée ici en dur plutôt que lue depuis
// tokens.css, que le navigateur ne peut pas consulter pour la barre d'état.
// viewportFit "cover" : nécessaire pour que env(safe-area-inset-bottom)
// (barre d'onglets, encoche) ait une vraie valeur sur iPhone.
export const viewport: Viewport = {
  themeColor: "#1F2557",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // "Réduire les animations" (F8, Should) : réglage lu ici, une fois, pour
  // tout le document — prioritaire sur `prefers-reduced-motion` du système
  // (règle du handoff), via la cascade CSS dans globals.css.
  const session = await getSession();
  const user = session
    ? await db.user.findUnique({ where: { id: session.userId }, select: { reduceMotion: true } })
    : null;

  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${roboto.variable} h-full`}
      data-reduce-motion={user?.reduceMotion ? "true" : undefined}
    >
      <body className="min-h-full flex flex-col">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
