"use client";

import Link from "next/link";
import { useState } from "react";
import { useFab } from "@/components/nav/FabContext";
import { CategoryCard } from "@/components/mois/CategoryCard";
import { IconCheck } from "@/components/ui/Icons";
import { etatMois } from "@/lib/calculations";
import { formatFcfa, formatMontant } from "@/lib/format";

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  kind: string;
  total: number;
  part: number;
  lineCount: number;
}

interface DashboardProps {
  revenu: number;
  affecte: number;
  depense: number;
  restant: number;
  categories: CategoryItem[];
  resteParJour: number;
  resteParSemaine: number;
  projection3: number;
  epargneMensuelle: number;
  categorieHref: string;
  ajoutHref: string;
}

/**
 * Le tableau de bord lui-même (`.dash` : `.a-bal`/`.a-cats`/`.a-proj`),
 * fidèle à `Mois.dc.html`. Composant client uniquement pour la bascule
 * bandeau de célébration ↔ puce "Mois bouclé" (`state.banner` dans le
 * canvas) et l'enregistrement du bouton flottant.
 */
export function MoisDashboard({
  revenu,
  affecte,
  depense,
  restant,
  categories,
  resteParJour,
  resteParSemaine,
  projection3,
  epargneMensuelle,
  categorieHref,
  ajoutHref,
}: DashboardProps) {
  const [bannerOpen, setBannerOpen] = useState(true);
  useFab({ label: "Ajouter une ligne", href: ajoutHref });

  const etat = etatMois(revenu, restant);
  const revenuManquant = etat === "revenu_manquant";
  const pct = revenu > 0 ? Math.round((affecte / revenu) * 100) : 0;
  const meterW = Math.min(100, pct);
  const meterCls = etat === "depasse" ? "over" : etat === "boucle" ? "ok" : "";
  const caption =
    etat === "revenu_manquant"
      ? "Ajoute ton revenu pour voir ton restant se calculer"
      : etat === "boucle"
        ? `${pct} % du revenu affecté · chaque franc est à sa place`
        : etat === "en_cours"
          ? `${pct} % du revenu affecté · ${formatMontant(restant)} FCFA à répartir`
          : `${pct} % du revenu affecté · ${formatMontant(Math.abs(restant))} FCFA de trop`;

  const showCelebrate = etat === "boucle" && bannerOpen;
  const showDelta = etat === "boucle" && !bannerOpen;

  const projRows = [
    { label: "Dans 1 mois", value: epargneMensuelle },
    { label: "Dans 2 mois", value: epargneMensuelle * 2 },
    { label: "Dans 3 mois", value: projection3 },
  ];
  const maxProj = Math.max(1, ...projRows.map((r) => r.value));

  return (
    <>
      {revenuManquant ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div className="row-main" style={{ minWidth: 200 }}>
            <div className="row-title" style={{ whiteSpace: "normal" }}>
              Aucun revenu configuré pour ce mois.
            </div>
            <div className="row-sub">Ajoute une source de revenu pour voir ton restant se calculer.</div>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/revenus">
            Ajouter un revenu
          </Link>
        </div>
      ) : null}

      {showCelebrate ? (
        <div className="celebrate" role="status">
          <div className="celebrate-icon">
            <IconCheck />
          </div>
          <div className="row-main">
            <div className="celebrate-title">Mois bouclé à 0</div>
            <div className="row-sub">Chaque franc a trouvé sa place. Bien joué.</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBannerOpen(false)}>
            Fermer
          </button>
        </div>
      ) : null}

      {etat === "depasse" ? (
        <div
          className="card"
          role="alert"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", boxShadow: "inset 0 0 0 2px var(--over)" }}
        >
          <svg
            className="ico"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: "var(--over)", width: 24, height: 24 }}
          >
            <path d="M12 8v5M12 16.5v.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <div className="row-main">
            <div className="row-title" style={{ whiteSpace: "normal" }}>
              Tu dépasses ton revenu de {formatFcfa(Math.abs(restant))}.
            </div>
            <div className="row-sub">Retire ou réduis une ligne pour retrouver un restant à 0.</div>
          </div>
          <Link className="btn btn-secondary btn-sm" href={categorieHref}>
            Ajuster une ligne
          </Link>
        </div>
      ) : null}

      {etat === "en_cours" ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div className="row-main" style={{ minWidth: 200 }}>
            <div className="row-title" style={{ whiteSpace: "normal" }}>
              Il te reste {formatFcfa(restant)} à placer.
            </div>
            <div className="row-sub">Tu peux les affecter à une ligne d&apos;épargne pour boucler le mois à 0.</div>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/epargne">
            Affecter à l&apos;épargne
          </Link>
        </div>
      ) : null}

      <div className="dash">
        <section className="a-bal">
          <div className="card stack" style={{ padding: "var(--space-6)" }}>
            <div className="label">Restant ce mois</div>
            <div className="wrap">
              <div className="t-xl" style={{ color: restant < 0 ? "var(--over)" : "var(--ink)" }}>
                {formatMontant(restant)}&nbsp;FCFA
              </div>
              {showDelta ? <span className="delta">Mois bouclé</span> : null}
            </div>
            <div className={`meter ${meterCls}`} role="img" aria-label={`${pct} % du revenu affecté`}>
              <span style={{ width: `${meterW}%` }} />
            </div>
            <div className="caption">{caption}</div>
            <div className="stats">
              <div className="stat">
                <div className="caption">Revenu</div>
                <div className="amount">{formatMontant(revenu)}</div>
              </div>
              <div className="stat">
                <div className="caption">Affecté</div>
                <div className="amount">{formatMontant(affecte)}</div>
              </div>
              <div className="stat">
                <div className="caption">Dépensé</div>
                <div className="amount">{formatMontant(depense)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="a-cats">
          <div className="sec-title">
            <h2 className="label" style={{ margin: 0 }}>
              Où va ton revenu
            </h2>
            <span className="wrap" style={{ gap: "var(--space-4)" }}>
              <Link className="link" href="/categories" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                Gérer
              </Link>
              <Link className="link" href={categorieHref} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                Tout voir
              </Link>
            </span>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <CategoryCard key={c.id} {...c} />
            ))}
          </div>

          {resteParJour !== 0 || resteParSemaine !== 0 ? (
            <div className="card stack" style={{ marginTop: "var(--space-4)" }}>
              <div className="label">Argent de poche</div>
              <div className="wrap" style={{ gap: "var(--space-6)" }}>
                <div>
                  <div className="caption">Par jour</div>
                  <div className="t-md amount">{formatFcfa(resteParJour)}</div>
                </div>
                <div>
                  <div className="caption">Par semaine</div>
                  <div className="t-md amount">{formatFcfa(resteParSemaine)}</div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="a-proj">
          <div className="card stack" style={{ ["--c" as string]: "var(--cat-savings)" }}>
            <div className="label">Épargne dans 3 mois</div>
            <div className="t-lg">{formatMontant(projection3)}&nbsp;FCFA</div>
            <div className="caption">{formatFcfa(epargneMensuelle)} par mois, sur les comptes inclus dans la projection</div>
            <div
              className="proj"
              style={{ height: 120 }}
              role="img"
              aria-label={`Épargne cumulée : ${projRows.map((r) => formatFcfa(r.value)).join(", ")}`}
            >
              {projRows.map((r) => (
                <div className="proj-col" key={r.label}>
                  <div className="proj-val">{formatMontant(r.value)}</div>
                  <div className="proj-bar" style={{ height: `${Math.max(6, (r.value / maxProj) * 90)}px` }} />
                  <div className="caption">{r.label.replace("Dans ", "")}</div>
                </div>
              ))}
            </div>
            <Link className="link" href="/epargne">
              Voir la projection
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
