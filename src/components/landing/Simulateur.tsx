"use client";

import { useState, type CSSProperties } from "react";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { montantProposeCategorie } from "@/lib/calculations";
import { formatFcfa, formatMontant } from "@/lib/format";

function digitsOnly(raw: string, max: number): number {
  const v = raw.replace(/\D/g, "").slice(0, max);
  return v ? parseInt(v, 10) : 0;
}

/**
 * Mini-simulateur de la landing (F14, Should) : une vraie calculatrice, sans
 * création de compte. Mêmes pourcentages par défaut que le premier
 * lancement (45/30/5/20). Fidèle à `Landing.dc.html` (section Simulateur).
 */
export function Simulateur() {
  const [revenu, setRevenu] = useState(880000);
  const [percents, setPercents] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.name, c.defaultPercent]))
  );

  const totalPercent = Object.values(percents).reduce((sum, p) => sum + p, 0);
  const scale = totalPercent > 100 ? 100 / totalPercent : 1;

  const totalMessage =
    totalPercent === 100
      ? "Total : 100 %. Chaque franc est affecté."
      : totalPercent < 100
        ? `Il reste ${100 - totalPercent} % à répartir.`
        : `Tu dépasses de ${totalPercent - 100} %.`;
  const totalClass = totalPercent === 100 ? "t-income" : totalPercent > 100 ? "t-over" : "t-ink";

  return (
    <div className="sim">
      <div className="stack" style={{ gap: "var(--space-2)" }}>
        <label className="label" htmlFor="sim-revenu">
          Ton revenu du mois
        </label>
        <div className="sim-input">
          <input
            id="sim-revenu"
            className="sim-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={revenu ? formatMontant(revenu) : ""}
            onChange={(e) => setRevenu(digitsOnly(e.target.value, 9))}
          />
          <span className="muted">FCFA</span>
        </div>
      </div>

      <div
        className="seg"
        role="img"
        aria-label={`Répartition : ${DEFAULT_CATEGORIES.map((c) => `${percents[c.name] ?? 0} % ${c.name.toLowerCase()}`).join(", ")}`}
      >
        {DEFAULT_CATEGORIES.map((c) => (
          <span key={c.name} style={{ width: `${(percents[c.name] ?? 0) * scale}%`, "--c": `var(--${c.color})` } as CSSProperties} />
        ))}
      </div>

      <div className="stack" style={{ gap: "var(--space-3)" }}>
        {DEFAULT_CATEGORIES.map((c) => (
          <div key={c.name} className="sim-row">
            <span className="dot" style={{ "--c": `var(--${c.color})` } as CSSProperties} />
            <label htmlFor={`sim-pct-${c.name}`}>{c.name}</label>
            <input
              id={`sim-pct-${c.name}`}
              className="pct-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={percents[c.name] ?? 0}
              onChange={(e) =>
                setPercents((prev) => ({ ...prev, [c.name]: Math.min(100, digitsOnly(e.target.value, 3)) }))
              }
              aria-label={`${c.name}, en pourcentage`}
            />
            <span className="row-amount amt">{formatFcfa(montantProposeCategorie(revenu, percents[c.name] ?? 0))}</span>
          </div>
        ))}
      </div>

      <div className={`caption ${totalClass}`} role="status">
        {totalMessage}
      </div>
      <div className="caption">Simulation indicative, rien n&apos;est enregistré.</div>
    </div>
  );
}
