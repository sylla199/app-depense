import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { Simulateur } from "@/components/landing/Simulateur";
import { ShowcaseCarousel } from "@/components/landing/ShowcaseCarousel";
import { NewsletterForm } from "@/components/landing/NewsletterForm";
import { IconCheck, IconHistorique, IconMois, IconRappels, IconShare } from "@/components/ui/Icons";
import { formatFcfa } from "@/lib/format";

const SIGNUP_HREF = "/connexion?mode=inscription";

const FEATURES = [
  {
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v9h9" />
        <path d="M20.5 15A9 9 0 1112 3" />
      </svg>
    ),
    title: "Répartis",
    body: "Quatre catégories, un pourcentage chacune. Le restant se calcule seul.",
    href: "#simulateur",
  },
  {
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18l5-6 4 3 7-9" />
        <path d="M15 6h5v5" />
      </svg>
    ),
    title: "Épargne",
    body: "Projette ton épargne de 1 à 24 mois, compte par compte.",
    href: "#fonctions",
  },
  {
    icon: <IconMois />,
    title: "Planifie",
    body: "Liste ce que tu veux acheter : le total du projet se calcule tout seul.",
    href: "#projets",
  },
  {
    icon: <IconRappels />,
    title: "Rappels",
    body: "Une alerte avant chaque échéance fixe, au moment qui te convient.",
    href: null,
  },
];

const PASTELS = [
  {
    cat: "cat-fixed",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M4 4l16 16" />
      </svg>
    ),
    title: "Aucune connexion bancaire",
    body: "Tu saisis toi-même, rien n'est lu sur ton compte.",
  },
  {
    cat: "cat-savings",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Données protégées",
    bodyPrefix: "Mot de passe chiffré et connexion sécurisée. Code PIN pour verrouiller l'app ",
  },
  {
    cat: "cat-project",
    icon: <IconShare />,
    title: "Export et suppression",
    body: "Tes données t'appartiennent : exporte-les ou supprime-les à tout moment.",
  },
];

/** Page d'accueil — fidèle à `Landing.dc.html`. */
export function LandingPage() {
  return (
    <div className="landing" id="top">
      <TopNav signupHref={SIGNUP_HREF} />

      {/* HeroBanner */}
      <div className="sec">
        <section
          className="band"
          style={{ minHeight: 640, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-6)" }}
        >
          <svg
            className="band-art"
            viewBox="0 0 1200 520"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M-40 420C200 300 380 520 640 380S1040 160 1260 260" stroke="var(--cat-savings)" strokeWidth="44" opacity=".6" />
            <path d="M-60 300C180 180 420 400 680 250S1060 60 1280 140" stroke="var(--cat-family)" strokeWidth="36" opacity=".6" />
            <path d="M-20 180C220 80 460 280 700 140S1040 -20 1240 40" stroke="var(--accent)" strokeWidth="30" opacity=".65" />
            <path d="M-40 500C240 420 480 560 740 470S1060 330 1260 400" stroke="var(--cat-pocket)" strokeWidth="28" opacity=".55" />
          </svg>
          <div style={{ font: "500 16px/24px var(--font-sans)", opacity: 0.9 }}>Le budget du mois, simplement</div>
          <h1>Chaque franc à sa place.</h1>
          <p style={{ margin: 0, maxWidth: "42ch", font: "400 18px/28px var(--font-sans)", opacity: 0.9 }}>
            Déclare ton revenu, répartis-le en quatre catégories et vois ce qu&apos;il te reste, au
            franc près.
          </p>
          <a className="btn btn-light" href={SIGNUP_HREF}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="3" width="12" height="18" rx="3" />
              <path d="M11 18h2" />
            </svg>
            Créer mon espace
          </a>
          <div className="card stack" style={{ width: "100%", maxWidth: 360, color: "var(--ink)", textAlign: "left", gap: "var(--space-2)" }}>
            <div className="label">Restant en octobre</div>
            <div className="t-lg">{formatFcfa(120000)}</div>
            <div className="meter ok" role="img" aria-label="86 % du revenu affecté">
              <span style={{ width: "86%" }} />
            </div>
            <div className="caption">
              {formatFcfa(760000)} affectés sur {formatFcfa(880000)} · exemple
            </div>
          </div>
          <p className="caption" style={{ margin: 0, color: "inherit", opacity: 0.85 }}>
            Sans connexion bancaire. Tu saisis, tu gardes la main.
          </p>
        </section>
      </div>

      {/* SectionHeading + ShowcaseCarousel */}
      <section id="fonctions" className="anchor">
        <div className="section-head" style={{ paddingTop: "var(--space-16)" }}>
          <h2>
            Répartis, épargne et planifie <Image className="inline-mark" src="/icons/icon-48.png" alt="" width={24} height={24} /> sans
            stress
          </h2>
        </div>
        <ShowcaseCarousel>
          <article className="showcase" style={{ "--c": "var(--cat-fixed)" } as CSSProperties}>
            <h3>Tes achats fixes, d&apos;un coup d&apos;œil.</h3>
            <div className="showcase-art">
              <div className="stack" style={{ width: "80%" }}>
                <div className="label">Achats fixes</div>
                <div className="t-md">{formatFcfa(400000)}</div>
                <div className="meter cat" role="img" aria-label="45 % du revenu">
                  <span style={{ width: "45%" }} />
                </div>
                <div className="caption">45 % du revenu</div>
              </div>
            </div>
          </article>
          <article className="showcase" style={{ "--c": "var(--cat-savings)" } as CSSProperties}>
            <h3>Vois ton épargne dans 3 mois.</h3>
            <div className="showcase-art">
              <div className="stack" style={{ width: "80%", gap: "var(--space-2)" }}>
                <div className="label">Épargne dans 3 mois</div>
                <div className="t-md">{formatFcfa(885000)}</div>
                <div
                  className="proj"
                  style={{ height: 90 }}
                  role="img"
                  aria-label="Épargne cumulée : 295 000 FCFA en novembre, 590 000 en décembre, 885 000 en janvier"
                >
                  <div className="proj-col">
                    <div className="proj-bar" style={{ height: 28 }} />
                  </div>
                  <div className="proj-col">
                    <div className="proj-bar" style={{ height: 56 }} />
                  </div>
                  <div className="proj-col">
                    <div className="proj-bar" style={{ height: 84 }} />
                  </div>
                </div>
              </div>
            </div>
          </article>
          <article className="showcase" style={{ "--c": "var(--cat-project)" } as CSSProperties}>
            <h3>Planifie l&apos;achat de ta maison.</h3>
            <div className="showcase-art">
              <div className="stack" style={{ width: "80%" }}>
                <div className="label">Projet d&apos;achat</div>
                <div className="t-md">{formatFcfa(950000)}</div>
                <div className="meter cat" role="img" aria-label="26 % du projet épargné">
                  <span style={{ width: "26%" }} />
                </div>
                <div className="caption">Mai 2027, dans 7 mois</div>
              </div>
            </div>
          </article>
          <article className="showcase" style={{ "--c": "var(--income)" } as CSSProperties}>
            <h3>Boucle ton mois à zéro.</h3>
            <div className="showcase-art">
              <div className="stack" style={{ width: "80%" }}>
                <div className="label">Restant ce mois</div>
                <div className="wrap">
                  <div className="t-md">0 FCFA</div>
                  <span className="delta">Mois bouclé</span>
                </div>
                <div className="meter ok" role="img" aria-label="100 % du revenu affecté">
                  <span style={{ width: "100%" }} />
                </div>
                <div className="caption">Chaque franc est à sa place.</div>
              </div>
            </div>
          </article>
          <article className="showcase" style={{ "--c": "var(--cat-pocket)" } as CSSProperties}>
            <h3>Sache ce qu&apos;il te reste par jour.</h3>
            <div className="showcase-art">
              <div className="stack" style={{ width: "80%" }}>
                <div className="label">Argent de poche</div>
                <div className="t-md">{formatFcfa(3300)}</div>
                <div className="meter cat" role="img" aria-label="Argent de poche utilisé à 35 %">
                  <span style={{ width: "35%" }} />
                </div>
                <div className="caption">par jour restant dans le mois</div>
              </div>
            </div>
          </article>
          <article className="showcase" style={{ "--c": "var(--cat-other)" } as CSSProperties}>
            <h3>
              Des rappels avant chaque échéance. <span className="tag" style={{ verticalAlign: "middle" }}>Bientôt</span>
            </h3>
            <div className="showcase-art">
              <IconRappels style={{ width: 48, height: 48, color: "var(--ink-muted)" }} />
            </div>
          </article>
        </ShowcaseCarousel>
      </section>

      <div className="sec" style={{ paddingTop: "var(--space-6)", display: "flex", justifyContent: "center" }}>
        <a className="btn btn-primary" href={SIGNUP_HREF}>
          Créer mon espace
        </a>
      </div>

      {/* FeatureCards */}
      <div className="sec" style={{ paddingTop: "var(--space-12)" }}>
        <div className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <div className="badge-icon" style={f.href ? { width: 48, height: 48 } : { width: 48, height: 48, background: "var(--surface-2)", color: "var(--ink-muted)" }}>
                {f.icon}
              </div>
              <h3>
                {f.title} {!f.href ? <span className="tag" style={{ verticalAlign: "middle" }}>Bientôt</span> : null}
              </h3>
              <p>{f.body}</p>
              {f.href ? (
                <a className="link" href={f.href}>
                  En savoir plus
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Projets d'achat */}
      <section id="projets" className="sec anchor gap-sec">
        <div className="split">
          <div className="stack" style={{ gap: "var(--space-4)", alignItems: "flex-start" }}>
            <span className="tag tag-accent">Projets d&apos;achat</span>
            <h2 className="d-lg">Ton projet, ligne par ligne.</h2>
            <p className="lead">
              Ajoute chaque élément avec son prix et sa quantité. Le total se calcule seul, tu vois
              ce que tu as déjà mis de côté et la date à laquelle tu y arrives.
            </p>
            <a className="btn btn-primary" href={SIGNUP_HREF} style={{ marginTop: "var(--space-2)" }}>
              Créer mon espace
            </a>
          </div>
          <div className="card stack" style={{ "--c": "var(--cat-project)", padding: "var(--space-6)", gap: "var(--space-4)" } as CSSProperties}>
            <div className="cat-head">
              <div className="row-icon">
                <IconMois />
              </div>
              <div className="row-main">
                <div className="row-title">Achat pour ma nouvelle maison</div>
                <div className="row-sub">4 éléments · exemple de projet</div>
              </div>
            </div>
            <div className="t-lg">{formatFcfa(950000)}</div>
            <div className="meter cat" role="img" aria-label="26 % du projet épargné">
              <span style={{ width: "26%" }} />
            </div>
            <div className="caption">
              26 % · {formatFcfa(250000)} épargnés, reste {formatFcfa(700000)}
            </div>
            <div>
              <div className="row done">
                <span className="check" aria-checked="true" aria-hidden="true">
                  <IconCheck />
                </span>
                <div className="row-main">
                  <div className="row-title">Canapé</div>
                  <div className="row-sub">{formatFcfa(350000)} × 1 · acheté</div>
                </div>
                <div className="row-amount">{formatFcfa(350000)}</div>
              </div>
              <div className="row">
                <span className="check" aria-checked="false" aria-hidden="true">
                  <IconCheck />
                </span>
                <div className="row-main">
                  <div className="row-title">Lit</div>
                  <div className="row-sub">{formatFcfa(200000)} × 1</div>
                </div>
                <div className="row-amount">{formatFcfa(200000)}</div>
              </div>
              <div className="row">
                <span className="check" aria-checked="false" aria-hidden="true">
                  <IconCheck />
                </span>
                <div className="row-main">
                  <div className="row-title">Réfrigérateur</div>
                  <div className="row-sub">{formatFcfa(300000)} × 1</div>
                </div>
                <div className="row-amount">{formatFcfa(300000)}</div>
              </div>
              <div className="row">
                <span className="check" aria-checked="false" aria-hidden="true">
                  <IconCheck />
                </span>
                <div className="row-main">
                  <div className="row-title">Chaises</div>
                  <div className="row-sub">{formatFcfa(25000)} × 4</div>
                </div>
                <div className="row-amount">{formatFcfa(100000)}</div>
              </div>
            </div>
            <div className="wrap">
              <span className="tag tag-accent">
                <IconHistorique />
                Mai 2027, dans 7 mois
              </span>
              <span className="caption">avec {formatFcfa(100000)} par mois</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simulateur */}
      <section id="simulateur" className="sec anchor gap-sec">
        <div className="split">
          <div className="stack" style={{ gap: "var(--space-4)", alignItems: "flex-start" }}>
            <span className="tag tag-accent">Simulateur</span>
            <h2 className="d-lg">Teste avec ton revenu.</h2>
            <p className="lead">
              Saisis ce que tu touches chaque mois et vois une répartition type en quatre
              catégories. Pas besoin de compte, rien n&apos;est enregistré.
            </p>
          </div>
          <Simulateur />
        </div>
      </section>

      {/* SecuritySection */}
      <section id="securite" className="sec anchor gap-sec">
        <div className="band">
          <div className="section-head" style={{ paddingTop: "var(--space-4)" }}>
            <h2>
              Tes données, sous ton <Image className="inline-mark" src="/icons/icon-48.png" alt="" width={24} height={24} /> contrôle
            </h2>
          </div>
          <div className="pastel-grid">
            {PASTELS.map((p) => (
              <article key={p.title} className="pastel" style={{ "--c": `var(--${p.cat})` } as CSSProperties}>
                <div className="badge-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>
                  {p.bodyPrefix ?? p.body}
                  {p.bodyPrefix ? <span className="tag" style={{ verticalAlign: "middle" }}>Bientôt</span> : null}
                </p>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
            <a className="btn btn-light" href={SIGNUP_HREF}>
              Créer mon espace
            </a>
          </div>
        </div>
      </section>

      {/* CtaBanner */}
      <section className="sec gap-sec">
        <div className="band accent" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)" }}>
          <h2 className="cta-h2">
            Prends le contrôle de ton mois. <Image className="inline-mark" src="/icons/icon-48.png" alt="" width={32} height={32} style={{ filter: "brightness(0) invert(1)" }} />{" "}
            Crée ton espace.
          </h2>
          <a className="btn btn-light" href={SIGNUP_HREF}>
            Créer mon espace
          </a>
          <p className="caption" style={{ margin: 0, maxWidth: "56ch", fontStyle: "italic", color: "inherit", opacity: 0.9 }}>
            Sans connexion bancaire. Tes données restent les tiennes : export et suppression à
            tout moment.
          </p>
        </div>
      </section>

      {/* SiteFooter */}
      <footer id="aide" className="anchor" style={{ paddingTop: "var(--space-16)" }}>
        <div style={{ padding: "0 var(--space-4)" }}>
          <div className="panel">
            <Image src="/icons/icon-48.png" alt="Dépenses" width={40} height={40} />
            <div>
              <NewsletterForm />
              <div className="footer-cols">
                <div>
                  <h4>Produit</h4>
                  <a href="#fonctions">Fonctions</a>
                  <a href="#securite">Sécurité</a>
                  <a href="#aide">Aide</a>
                </div>
                <div>
                  <h4>Ressources</h4>
                  <Link href="/premier-lancement">Guide de démarrage</Link>
                  <Link href="/installer">Installer l&apos;app</Link>
                  <Link href="/importer">Importer mon tableur</Link>
                </div>
                <div>
                  <h4>Société</h4>
                  <Link href="/confidentialite">À propos</Link>
                  <Link href="/confidentialite#contact">Contact</Link>
                </div>
              </div>
            </div>
            <span className="status" style={{ alignSelf: "end", justifySelf: "start" }}>
              Opérationnel
            </span>
          </div>
        </div>
        <div className="footer-meta">
          <span>© Dépenses 2026</span>
          <span>
            <Link href="/confidentialite#conditions">Conditions</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/confidentialite#cookies">Préférences de cookies</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
