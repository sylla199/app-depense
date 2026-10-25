"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
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
}

interface Badges {
  moisBoucle: boolean;
  premiereEpargne: boolean;
  objectifAtteint: boolean;
  serieDe3: boolean;
}

const BADGE_LABELS: Array<{ key: keyof Badges; label: string }> = [
  { key: "moisBoucle", label: "Mois bouclé à 0" },
  { key: "premiereEpargne", label: "Première épargne" },
  { key: "objectifAtteint", label: "Objectif atteint" },
  { key: "serieDe3", label: "Série de 3 mois" },
];

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
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 className="t-lg" style={{ margin: 0 }}>
          Historique
        </h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="quiet" size="sm" onClick={() => router.push("/epargne")}>
            Évolution
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport} disabled={!online}>
            {exported ? "Exporté" : "Exporter en CSV"}
          </Button>
          {prochain ? (
            <Button size="sm" onClick={onDuplicate} disabled={duplicating || !online}>
              Créer {formatMoisEnLettres(prochain.year, prochain.month)}
            </Button>
          ) : null}
        </div>
      </div>
      {!online ? (
        <p className="caption" style={{ margin: 0 }}>
          L&apos;export et la création d&apos;un nouveau mois nécessitent une connexion.
        </p>
      ) : null}

      {exported ? (
        <div className="snackbar" role="status" style={{ position: "static" }}>
          <span>historique-depenses.csv prêt</span>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}

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
        <div className="card">
          {months.map((m) => (
            <Link
              key={m.id}
              href="/mois"
              className="row"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="row-main">
                <p className="row-title" style={{ margin: 0 }}>
                  {formatMoisEnLettres(m.year, m.month)}
                </p>
                <p className="row-sub" style={{ margin: 0 }}>
                  Revenu {formatFcfa(m.revenu)} · {m.lineCount} lignes
                </p>
              </div>
              <span className={`row-amount ${m.restant === 0 ? "pos" : m.restant < 0 ? "neg" : ""}`}>
                {m.restant === 0 ? "Mois bouclé" : formatFcfa(m.restant)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="card">
        <p className="label" style={{ marginBottom: 4 }}>
          Ta série
        </p>
        <p className="t-md" style={{ margin: "0 0 12px" }}>
          {serie} {serie > 1 ? "mois bouclés d'affilée" : "mois bouclé d'affilée"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {BADGE_LABELS.map((b) => (
            <span
              key={b.key}
              className="chip"
              aria-pressed={badges[b.key]}
              style={{ opacity: badges[b.key] ? 1 : 0.4, cursor: "default" }}
            >
              {badges[b.key] ? "🏅" : "🔒"} {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
