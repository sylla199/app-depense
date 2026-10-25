import Link from "next/link";
import { DeconnexionButton } from "@/components/auth/DeconnexionButton";

export default function ReglagesPage() {
  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 className="t-lg">Réglages</h1>

      <div className="card">
        <p className="label" style={{ marginBottom: 12 }}>
          Compte
        </p>
        <Link href="/categories" className="btn btn-secondary btn-block" style={{ marginBottom: 12 }}>
          Gérer les catégories
        </Link>
        <Link href="/revenus" className="btn btn-secondary btn-block">
          Mes sources de revenu
        </Link>
      </div>

      <div className="card">
        <p className="label" style={{ marginBottom: 12 }}>
          Préférences
        </p>
        <p className="caption">
          Devise : FCFA. Mode discret, réduire les animations, thème sombre et code PIN arrivent
          dans un prochain jalon.
        </p>
      </div>

      <div className="card">
        <DeconnexionButton />
      </div>
    </div>
  );
}
