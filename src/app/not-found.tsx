import Link from "next/link";
import Image from "next/image";

/** Page introuvable — fidèle à `Introuvable.dc.html`. */
export default function NotFound() {
  return (
    <div className="pub" style={{ minHeight: "100vh" }}>
      <header className="pub-head">
        <Link href="/" className="topnav-brand">
          <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
          Dépenses
        </Link>
        <Link href="/" className="btn btn-secondary btn-sm">
          Retour à l&apos;accueil
        </Link>
      </header>
      <main className="pub-main">
        <div
          className="card stack"
          style={{ alignItems: "center", textAlign: "center", padding: "var(--space-12) var(--space-6)", gap: "var(--space-4)" }}
        >
          <div className="badge-icon">
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4M9 9l4 4M13 9l-4 4" />
            </svg>
          </div>
          <h1 className="screen-title" style={{ font: "600 24px/32px var(--font-display)" }}>
            Cette page n&apos;existe pas
          </h1>
          <p className="muted" style={{ maxWidth: "42ch" }}>
            Le lien est peut-être ancien ou mal copié. Ton budget, lui, n&apos;a pas bougé.
          </p>
          <div className="wrap" style={{ justifyContent: "center" }}>
            <Link href="/mois" className="btn btn-primary">
              Retour à mon mois
            </Link>
            <Link href="/" className="btn btn-secondary">
              Aller à l&apos;accueil
            </Link>
          </div>
          <Link href="/#aide" className="link" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>
            Un problème persistant ? Écris-nous
          </Link>
        </div>
      </main>
      <footer className="pub-foot">
        <Link href="/#aide">Aide</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/confidentialite#conditions">Conditions</Link>
        <Link href="/confidentialite#cookies">Cookies</Link>
        <span style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>© Dépenses 2026</span>
      </footer>
    </div>
  );
}
