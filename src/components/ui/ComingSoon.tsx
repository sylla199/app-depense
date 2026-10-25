import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description?: string;
}

/**
 * Remplace un écran non construit dans ce jalon par un message clair,
 * plutôt qu'une page 404 — les modules listés dans CLAUDE.md arriveront
 * jalon par jalon (section 9 du cahier des charges).
 */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="card" style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
      <p className="t-md" style={{ margin: "0 0 8px" }}>
        {title}
      </p>
      <p className="caption" style={{ margin: "0 0 16px" }}>
        {description ?? "Ce module arrive dans un prochain jalon."}
      </p>
      <Link href="/mois" className="btn btn-secondary">
        Retour à mon mois
      </Link>
    </div>
  );
}
