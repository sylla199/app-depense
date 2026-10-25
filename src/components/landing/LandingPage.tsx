import Link from "next/link";
import type { CSSProperties } from "react";
import { Simulateur } from "@/components/landing/Simulateur";
import { ShowcaseCarousel } from "@/components/landing/ShowcaseCarousel";
import { NewsletterForm } from "@/components/landing/NewsletterForm";
import { formatFcfa } from "@/lib/format";

const FEATURES = [
  {
    title: "Répartis ton revenu",
    body: "Achats fixes, épargne, famille, argent de poche : quatre catégories pour voir où va chaque franc.",
  },
  {
    title: "Suis tes dépenses",
    body: "Ajoute une ligne en quelques secondes, vois ton restant se mettre à jour en direct.",
  },
  {
    title: "Épargne et projette",
    body: "Combien tu auras mis de côté dans 3 mois ? La réponse est sur ton tableau de bord.",
  },
  {
    title: "Planifie tes projets",
    body: "Équipement, voyage, gros achat : suis ta progression jusqu'à l'objectif.",
  },
  {
    title: "Installe-la comme une app",
    body: "Sur ton téléphone, en plein écran, sans App Store.",
  },
];

const FAQ = [
  {
    q: "Dois-je relier mon compte bancaire ?",
    a: "Non. Tu saisis tes montants toi-même, rien n'est connecté à ta banque.",
  },
  {
    q: "Puis-je exporter mes données ?",
    a: "Oui, à tout moment, en CSV ou en JSON, depuis tes réglages.",
  },
  {
    q: "Que se passe-t-il si je supprime mon compte ?",
    a: "Tes données sont effacées définitivement, sous 30 jours au plus tard.",
  },
  {
    q: "Puis-je l'utiliser sur mon téléphone ?",
    a: "Oui, installe-la comme une application depuis ton navigateur — aucun App Store nécessaire.",
  },
];

export function LandingPage() {
  return (
    <div>
      <header className="topnav">
        <a href="#top" className="topnav-brand">
          Gérer mes dépenses
        </a>
        <nav aria-label="Sections de la page">
          <ul className="topnav-links">
            <li>
              <a href="#fonctions">Fonctions</a>
            </li>
            <li>
              <a href="#projets">Projets d&apos;achat</a>
            </li>
            <li>
              <a href="#simulateur">Simulateur</a>
            </li>
            <li>
              <a href="#securite">Sécurité</a>
            </li>
            <li>
              <a href="#aide">Aide</a>
            </li>
          </ul>
        </nav>
        <Link href="/connexion?mode=inscription" className="btn btn-primary btn-sm">
          Créer mon espace
        </Link>
      </header>

      <section id="top" className="band">
        <div className="panel" style={{ textAlign: "center" }}>
          <h1 className="t-xl" style={{ color: "var(--on-band)", margin: "0 0 16px" }}>
            Répartis. Épargne. Planifie.
          </h1>
          <p style={{ maxWidth: 560, margin: "0 auto 24px", fontSize: 18 }}>
            Gérer mes dépenses t&apos;aide à boucler ton mois à zéro : chaque franc de ton revenu
            trouve sa place, et tu vois ton épargne se construire mois après mois.
          </p>
          <Link href="/connexion?mode=inscription" className="btn btn-primary">
            Créer mon espace
          </Link>
        </div>
      </section>

      <section id="fonctions" className="panel">
        <p className="label" style={{ marginBottom: 8 }}>
          Fonctions
        </p>
        <h2 className="t-lg" style={{ marginTop: 0, marginBottom: 24 }}>
          Tout ce qu&apos;il faut pour boucler ton mois
        </h2>
        <ShowcaseCarousel>
          {FEATURES.map((f) => (
            <div key={f.title} className="card showcase-card">
              <p className="t-md" style={{ marginTop: 0 }}>
                {f.title}
              </p>
              <p className="caption">{f.body}</p>
            </div>
          ))}
        </ShowcaseCarousel>
      </section>

      <section id="projets" className="panel">
        <div
          className="card card-lg"
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }}
        >
          <div>
            <p className="label" style={{ marginBottom: 8 }}>
              Projets d&apos;achat
            </p>
            <h2 className="t-lg" style={{ marginTop: 0 }}>
              Planifie tes gros achats, sans jamais perdre le fil
            </h2>
            <p>
              Équipement d&apos;une nouvelle maison, voyage, matériel : ajoute les éléments avec
              leur prix, et vois ta progression se mettre à jour automatiquement.
            </p>
            <Link href="/connexion?mode=inscription" className="btn btn-secondary">
              Essayer
            </Link>
          </div>
          <div className="card" style={{ background: "var(--surface-2)" }}>
            <div className="cat-head">
              <span className="dot" style={{ "--c": "var(--cat-project)" } as CSSProperties} />
              <span className="row-title">Équipement nouvelle maison</span>
            </div>
            <p className="t-md amount" style={{ margin: "0 0 8px" }}>
              {formatFcfa(950000)}
            </p>
            <div className="meter cat" style={{ "--c": "var(--cat-project)" } as CSSProperties}>
              <span style={{ width: "26%" }} />
            </div>
            <p className="caption" style={{ margin: "8px 0 0" }}>
              26 % · {formatFcfa(250000)} épargnés, reste {formatFcfa(700000)}
            </p>
          </div>
        </div>
      </section>

      <section id="simulateur" className="panel">
        <p className="label" style={{ marginBottom: 8 }}>
          Simulateur
        </p>
        <h2 className="t-lg" style={{ marginTop: 0, marginBottom: 8 }}>
          Essaie, sans créer de compte
        </h2>
        <p className="caption" style={{ marginBottom: 24 }}>
          Saisis un revenu et une répartition type par catégorie.
        </p>
        <Simulateur />
      </section>

      <section id="securite" className="panel">
        <p className="label" style={{ marginBottom: 8 }}>
          Sécurité
        </p>
        <h2 className="t-lg" style={{ marginTop: 0, marginBottom: 24 }}>
          Ayez l&apos;esprit tranquille
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div className="pastel">
            <p className="t-md" style={{ marginTop: 0 }}>
              Pas de connexion bancaire
            </p>
            <p className="caption">Tu saisis tes montants toi-même, rien n&apos;est relié à ta banque.</p>
          </div>
          <div className="pastel">
            <p className="t-md" style={{ marginTop: 0 }}>
              Données protégées
            </p>
            <p className="caption">Mot de passe chiffré, aucune revente de données, aucune publicité ciblée.</p>
          </div>
          <div className="pastel">
            <p className="t-md" style={{ marginTop: 0 }}>
              Toi seul décides
            </p>
            <p className="caption">Exporte ou supprime tes données à tout moment, depuis tes réglages.</p>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="panel" style={{ textAlign: "center" }}>
          <h2 className="t-lg" style={{ color: "var(--on-band)", marginTop: 0 }}>
            Prêt à boucler ton mois à zéro ?
          </h2>
          <Link href="/connexion?mode=inscription" className="btn btn-primary" style={{ marginTop: 8 }}>
            Créer mon espace
          </Link>
        </div>
      </section>

      <section id="aide" className="panel" style={{ maxWidth: 720 }}>
        <p className="label" style={{ marginBottom: 8 }}>
          Aide
        </p>
        <h2 className="t-lg" style={{ marginTop: 0, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        {FAQ.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <footer className="site-footer">
        <div className="panel footer-cols">
          <div>
            <p className="topnav-brand" style={{ marginBottom: 8 }}>
              Gérer mes dépenses
            </p>
            <NewsletterForm />
          </div>
          <div>
            <h3>Produit</h3>
            <ul>
              <li>
                <a href="#fonctions">Fonctions</a>
              </li>
              <li>
                <a href="#projets">Projets d&apos;achat</a>
              </li>
              <li>
                <a href="#simulateur">Simulateur</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Ressources</h3>
            <ul>
              <li>
                <a href="#aide">Aide</a>
              </li>
              <li>
                <a href="#securite">Sécurité</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Société</h3>
            <ul>
              <li>
                <span className="footer-status caption">Opérationnel</span>
              </li>
              <li>
                <Link href="/confidentialite#conditions">Conditions</Link>
              </li>
              <li>
                <Link href="/confidentialite#donnees">Confidentialité</Link>
              </li>
              <li>
                <Link href="/confidentialite#cookies">Préférences de cookies</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
