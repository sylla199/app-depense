import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeconnexionButton } from "@/components/auth/DeconnexionButton";
import { PreferencesCard } from "@/components/parametres/PreferencesCard";
import { DonneesCard } from "@/components/parametres/DonneesCard";
import { InstallButton } from "@/components/pwa/InstallButton";

export default async function ReglagesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, reduceMotion: true },
  });
  if (!user) redirect("/connexion");

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 className="t-lg">Réglages</h1>

      <div className="card">
        <p className="label" style={{ marginBottom: 12 }}>
          Compte
        </p>
        <p className="caption" style={{ marginBottom: 12 }}>
          {user.email}
        </p>
        <Link href="/categories" className="btn btn-secondary btn-block" style={{ marginBottom: 12 }}>
          Gérer les catégories
        </Link>
        <Link href="/revenus" className="btn btn-secondary btn-block">
          Mes sources de revenu
        </Link>
      </div>

      <PreferencesCard reduceMotion={user.reduceMotion} />

      <div className="card">
        <p className="label" style={{ marginBottom: 12 }}>
          Application
        </p>
        <InstallButton />
      </div>

      <DonneesCard />

      <div className="card">
        <DeconnexionButton />
      </div>
    </div>
  );
}
