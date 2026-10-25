import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenu" style={{ padding: 16, display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: 420, textAlign: "center", marginTop: 64 }}>
        <p className="t-xl" style={{ margin: "0 0 8px" }}>
          404
        </p>
        <p className="t-md" style={{ margin: "0 0 8px" }}>
          Cette page n&apos;existe pas
        </p>
        <p className="caption" style={{ margin: "0 0 24px" }}>
          Vérifie l&apos;adresse, ou retourne à un endroit connu.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/mois" className="btn btn-primary">
            Retour à mon mois
          </Link>
          <Link href="/" className="btn btn-secondary">
            Aller à l&apos;accueil
          </Link>
          <a href="mailto:contact@gerer-mes-depenses.fr" className="caption">
            Nous contacter
          </a>
        </div>
      </div>
    </main>
  );
}
