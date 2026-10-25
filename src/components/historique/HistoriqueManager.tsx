"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconChevronLeft, IconPlus } from "@/components/ui/Icons";
import { ajouterMois } from "@/lib/date";
import { formatFcfa, formatMoisEnLettres } from "@/lib/format";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

interface MonthItem {
  id: string;
  year: number;
  month: number;
  revenu: number;
  restant: number;
  lineCount: number;
  current: boolean;
}

interface Badges {
  moisBoucle: boolean;
  premiereEpargne: boolean;
  objectifAtteint: boolean;
  serieDe3: boolean;
}

const BADGES: Array<{ key: keyof Badges; label: string; icon: React.ReactNode }> = [
  {
    key: "moisBoucle",
    label: "Mois bouclé à 0",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    ),
  },
  {
    key: "premiereEpargne",
    label: "Première épargne",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
    ),
  },
  {
    key: "objectifAtteint",
    label: "Objectif atteint",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r=".6" />
      </svg>
    ),
  },
  {
    key: "serieDe3",
    label: "Série de 3 mois",
    icon: (
      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    ),
  },
];

/** Historique des mois — fidèle à `Historique.dc.html`. */
export function HistoriqueManager({
  months,
  badges,
  serie,
}: {
  months: MonthItem[];
  badges: Badges;
  serie: number;
}) {
  const router = useRouter();
  const online = useOnlineStatus();
  const [exported, setExported] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plusRecent = months[0];
  const prochain = plusRecent ? ajouterMois(plusRecent.year, plusRecent.month, 1) : null;

  async function onDuplicate() {
    setError(null);
    setDuplicating(true);
    try {
      const res = await fetch("/api/mois/dupliquer", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Une erreur est survenue.");
        return;
      }
      router.refresh();
    } finally {
      setDuplicating(false);
    }
  }

  function onExport() {
    // Déclenche un téléchargement de fichier (Content-Disposition: attachment),
    // pas une navigation interne : router.push() ne ferait rien ici.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/mois/export";
    setExported(true);
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Link href="/mois" className="back only-mobile-block">
        <IconChevronLeft />
        Mois
      </Link>
      <div className="screen-head">
        <h1 className="screen-title">Historique</h1>
        <div className="head-actions">
          <Button variant="secondary" size="sm" onClick={() => router.push("/epargne")}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 20V11M12 20V5M19 20v-7" />
            </svg>
            Évolution
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport} disabled={!online || exported}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            {exported ? "Exporté" : "Exporter en CSV"}
          </Button>
          {prochain ? (
            <Button size="sm" onClick={onDuplicate} disabled={duplicating || !online}>
              <IconPlus />
              Créer {formatMoisEnLettres(prochain.year, prochain.month)}
            </Button>
          ) : null}
        </div>
      </div>

      {exported ? (
        <div className="snackbar" role="status" style={{ position: "static" }}>
          <span>historique-depenses.csv prêt</span>
          <span className="caption" style={{ color: "inherit" }}>
            dans tes téléchargements
          </span>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
      {!online ? (
        <p className="caption" style={{ margin: 0 }}>
          L&apos;export et la création d&apos;un nouveau mois nécessitent une connexion.
        </p>
      ) : null}

      <p className="muted" style={{ margin: 0, maxWidth: "60ch" }}>
        Un nouveau mois copie les lignes et les montants du mois précédent. Tu les ajustes ensuite.
      </p>

      {months.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p>Aucun mois pour l&apos;instant.</p>
          <p className="caption" style={{ margin: "8px 0 16px" }}>
            Importe ton tableur actuel pour démarrer sans tout ressaisir.
          </p>
          <Link href="/importer" className="btn btn-primary">
            Importer un tableur
          </Link>
        </div>
      ) : (
        <div className="cols-main">
          <section className="card" style={{ padding: "var(--space-4) var(--space-4) var(--space-2)" }}>
            {months.map((m) => (
              <Link
                key={m.id}
                href="/mois"
                className="row link-row"
                style={{ "--c": "var(--cat-other)" } as React.CSSProperties}
              >
                <div className="row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </div>
                <div className="row-main">
                  <div className="row-title">{formatMoisEnLettres(m.year, m.month)}</div>
                  <div className="row-sub">
                    {m.current ? "En cours · " : ""}Revenu {formatFcfa(m.revenu)}
                  </div>
                </div>
                {m.restant === 0 ? (
                  <div className="row-end">
                    <span className="delta">Mois bouclé</span>
                  </div>
                ) : (
                  <div className="row-end">
                    <div className={`row-amount ${m.restant > 0 ? "pos" : ""}`}>{formatFcfa(m.restant)}</div>
                    <div className="row-sub">restant</div>
                  </div>
                )}
              </Link>
            ))}
          </section>

          <aside className="stack" style={{ gap: "var(--space-4)" }}>
            <div className="card stack">
              <div className="label">Ta série</div>
              <div className="t-md">
                {serie} {serie > 1 ? "mois bouclés d'affilée" : "mois bouclé d'affilée"}
              </div>
              <div className="caption">
                {serie < 3
                  ? `Encore ${3 - serie} mois à 0 pour débloquer « Série de 3 mois ».`
                  : "Série de 3 mois débloquée."}
              </div>
            </div>
            <div className="features" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-3)" }}>
              {BADGES.map((b) => (
                <div key={b.key} className={`badge ${badges[b.key] ? "" : "locked"}`} aria-label={badges[b.key] ? undefined : `${b.label}, verrouillé`}>
                  <div className="badge-icon">{b.icon}</div>
                  <div className="badge-name">{b.label}</div>
                  <span className="caption">{badges[b.key] ? "Débloqué" : "Verrouillé"}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
