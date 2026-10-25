import { formatFcfa } from "@/lib/format";

interface SoldeCardProps {
  revenu: number;
  affecte: number;
  depense: number;
  restant: number;
}

/**
 * Carte de solde du tableau de bord : restant en grand, barre de
 * progression, trois chiffres (Revenu, Affecté, Dépensé). Message à trois
 * variantes selon le signe du restant (section "Mois (tableau de bord)").
 */
export function SoldeCard({ revenu, affecte, depense, restant }: SoldeCardProps) {
  const pct = revenu > 0 ? Math.min(100, Math.round((affecte / revenu) * 100)) : 0;
  const meterClass = restant < 0 ? "over" : restant === 0 ? "ok" : "";

  return (
    <div className="card card-lg">
      <p className="label" style={{ marginBottom: 4 }}>
        Ce qu&apos;il te reste
      </p>
      <p
        className="t-xl amount"
        aria-live="polite"
        style={{ margin: "0 0 12px", color: restant < 0 ? "var(--over)" : "var(--ink)" }}
      >
        {formatFcfa(restant)}
      </p>

      <div className={`meter ${meterClass}`} role="img" aria-label={`${pct} % de ton revenu affecté`}>
        <span style={{ width: `${pct}%` }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div>
          <p className="caption" style={{ margin: 0 }}>
            Revenu
          </p>
          <p className="row-amount" style={{ margin: 0 }}>
            {formatFcfa(revenu)}
          </p>
        </div>
        <div>
          <p className="caption" style={{ margin: 0 }}>
            Affecté
          </p>
          <p className="row-amount" style={{ margin: 0 }}>
            {formatFcfa(affecte)}
          </p>
        </div>
        <div>
          <p className="caption" style={{ margin: 0 }}>
            Dépensé
          </p>
          <p className="row-amount" style={{ margin: 0 }}>
            {formatFcfa(depense)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RestantMessage({ restant }: { restant: number }) {
  if (restant === 0) {
    return (
      <div className="celebrate" role="status">
        🎉 Mois bouclé à 0. Chaque franc a trouvé sa place.
      </div>
    );
  }
  if (restant > 0) {
    return (
      <p className="caption" aria-live="polite" style={{ margin: 0 }}>
        Il te reste {formatFcfa(restant)} à placer.
      </p>
    );
  }
  return (
    <p
      role="alert"
      aria-live="polite"
      className="field-error"
      style={{ margin: 0 }}
    >
      <span aria-hidden="true">!</span> Tu dépasses ton revenu de {formatFcfa(Math.abs(restant))}.
    </p>
  );
}
