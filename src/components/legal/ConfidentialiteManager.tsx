"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

/** Confidentialité et conditions — fidèle à `Confidentialite.dc.html`. */
export function ConfidentialiteManager() {
  const [audience, setAudience] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <div className="stack" style={{ gap: "var(--space-3)" }}>
        <h1 className="screen-title" style={{ font: "600 32px/40px var(--font-display)", letterSpacing: "-.5px" }}>
          Confidentialité et conditions
        </h1>
        <p className="muted">
          Ce qu&apos;on garde de toi, pourquoi, et comment tu reprends la main. Dernière mise à
          jour : octobre 2026.
        </p>
        <div className="notice" role="note">
          Texte provisoire, rédigé pour la maquette. À faire relire par un juriste avant la mise en
          ligne.
        </div>
        <nav className="toc" aria-label="Sur cette page">
          <a className="chip" href="#donnees">
            Données
          </a>
          <a className="chip" href="#droits">
            Tes droits
          </a>
          <a className="chip" href="#cookies">
            Cookies
          </a>
          <a className="chip" href="#conditions">
            Conditions
          </a>
        </nav>
      </div>

      <section id="donnees" className="card stack anchor" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }} aria-labelledby="t-d">
        <h2 id="t-d">Les données qu&apos;on garde</h2>
        <p className="muted">
          Ton adresse e-mail, ton mot de passe (stocké chiffré, jamais lisible), et ce que tu
          saisis toi-même : revenus, lignes de budget, montants dépensés, projets d&apos;achat et
          rappels.
        </p>
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <div className="row-title">Ce qu&apos;on ne fait pas</div>
          <p className="muted">
            Pas de connexion à ton compte bancaire. Pas de revente de données. Pas de publicité
            ciblée.
          </p>
        </div>
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <div className="row-title">Où elles sont stockées</div>
          <p className="muted">
            Sur des serveurs sécurisés, avec une copie sur ton appareil pour que l&apos;app marche
            sans connexion. Lieu d&apos;hébergement : à préciser avant la mise en ligne.
          </p>
        </div>
      </section>

      <section id="droits" className="card stack anchor" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }} aria-labelledby="t-r">
        <h2 id="t-r">Tes droits</h2>
        <div className="stack" style={{ gap: 0 }}>
          <div className="settings-row">
            <div className="row-main">
              <div className="row-title">Exporter tes données</div>
              <div className="caption">Un fichier CSV de tout ton historique, depuis l&apos;écran Historique.</div>
            </div>
          </div>
          <div className="settings-row">
            <div className="row-main">
              <div className="row-title">Corriger</div>
              <div className="caption">Tout ce que tu as saisi reste modifiable, ligne par ligne.</div>
            </div>
          </div>
          <div className="settings-row">
            <div className="row-main">
              <div className="row-title">Supprimer ton compte</div>
              <div className="caption">
                Dans Réglages, « Supprimer mon compte ». Tes données sont effacées sous 30 jours.
              </div>
            </div>
          </div>
        </div>
        <div className="wrap">
          <Link href="/reglages" className="btn btn-secondary btn-sm">
            Ouvrir les réglages
          </Link>
          <Link href="/#aide" className="btn btn-quiet btn-sm">
            Poser une question
          </Link>
        </div>
      </section>

      <section id="cookies" className="card stack anchor" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }} aria-labelledby="t-c">
        <h2 id="t-c">Cookies et préférences</h2>
        <p className="muted">
          On utilise le strict nécessaire pour te garder connecté et retenir ton thème. La mesure
          d&apos;audience est facultative et anonyme.
        </p>
        <div className="stack" style={{ gap: 0 }}>
          <div className="settings-row">
            <div className="row-main" style={{ flex: 1 }}>
              <div className="row-title">Essentiels</div>
              <div className="caption">Connexion, thème clair ou sombre. Toujours actifs.</div>
            </div>
            <button className="switch" role="switch" aria-checked="true" aria-label="Cookies essentiels, toujours actifs" disabled />
          </div>
          <div className="settings-row">
            <div className="row-main" style={{ flex: 1 }}>
              <div className="row-title">Mesure d&apos;audience</div>
              <div className="caption">Pages vues, sans identifiant personnel.</div>
            </div>
            <Switch
              checked={audience}
              onChange={(next) => {
                setAudience(next);
                setSaved(false);
              }}
              label="Mesure d'audience"
            />
          </div>
        </div>
        <div className="wrap">
          <Button size="sm" onClick={() => setSaved(true)}>
            Enregistrer mes choix
          </Button>
          {saved ? (
            <span className="caption t-income" role="status" style={{ fontWeight: 600 }}>
              Choix enregistrés
            </span>
          ) : null}
        </div>
      </section>

      <section id="conditions" className="card stack anchor" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }} aria-labelledby="t-k">
        <h2 id="t-k">Conditions d&apos;utilisation, en bref</h2>
        <ol className="stack" style={{ gap: "var(--space-3)", margin: 0, paddingLeft: "var(--space-6)" }}>
          <li className="muted">L&apos;app est pour ton usage personnel.</li>
          <li className="muted">
            Tu restes responsable de ce que tu saisis. Dépenses calcule, elle ne vérifie pas tes
            comptes.
          </li>
          <li className="muted">
            Ce n&apos;est pas un conseil financier. Les simulations sont des projections, pas des
            promesses.
          </li>
          <li className="muted">
            Le service vise la meilleure disponibilité possible, sans garantie absolue.
          </li>
          <li className="muted">Tu peux arrêter à tout moment et récupérer tes données.</li>
        </ol>
      </section>
    </>
  );
}
