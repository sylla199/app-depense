import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Gérer mes dépenses — Boucle ton mois à zéro",
  description:
    "Répartis ton revenu, suis tes dépenses et vois ton épargne se construire mois après mois. Gratuit, sans connexion bancaire.",
  openGraph: {
    title: "Gérer mes dépenses",
    description: "Boucle ton mois à zéro : revenu, dépenses et épargne au même endroit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gérer mes dépenses",
    description: "Boucle ton mois à zéro : revenu, dépenses et épargne au même endroit.",
  },
};

export default async function RootPage() {
  const session = await getSession();
  if (session) {
    const hasOnboarded = (await db.revenueSource.count({ where: { userId: session.userId } })) > 0;
    redirect(hasOnboarded ? "/mois" : "/premier-lancement");
  }

  return <LandingPage />;
}
