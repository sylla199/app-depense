"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { montantProposeCategorie } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

/**
 * Mini-simulateur de la landing (F14, Should) : une vraie calculatrice, sans
 * création de compte. Mêmes pourcentages par défaut que le premier
 * lancement (45/30/5/20) et le même message de total que la répartition de
 * l'espace client.
 */
export function Simulateur() {
  const [revenu, setRevenu] = useState(880000);
  const [percents, setPercents] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.name, c.defaultPercent]))
  );

  const totalPercent = useMemo(
    () => Object.values(percents).reduce((sum, p) => sum + p, 0),
    [percents]
  );

  const totalMessage =
    totalPercent === 100
      ? "Total : 100 %. Chaque franc est affecté."
      : totalPercent < 100
        ? `Il reste ${100 - totalPercent} % à répartir.`
        : `Tu dépasses de ${totalPercent - 100} %.`;

  return (
    <div className="card card-lg" id="simulateur-carte">
      <div className="field-box" style={{ marginBottom: 16, maxWidth: 240 }}>
        <label className="label" htmlFor="sim-revenu">
          Ton revenu du mois
        </label>
        <input
          id="sim-revenu"
          className="input input-amount"
          type="number"
          inputMode="numeric"
          value={revenu}
          onChange={(e) => setRevenu(Number(e.target.value) || 0)}
        />
      </div>

      <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {DEFAULT_CATEGORIES.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="dot" style={{ "--c": `var(--${c.color})` } as CSSProperties} />
            <span style={{ flex: 1 }}>{c.name}</span>
            <input
              type="number"
              className="input"
              style={{ width: 72, textAlign: "right" }}
              value={percents[c.name] ?? 0}
              onChange={(e) =>
                setPercents((prev) => ({ ...prev, [c.name]: Number(e.target.value) || 0 }))
              }
              aria-label={`Pourcentage pour ${c.name}`}
            />
            <span className="caption" style={{ width: 16 }}>
              %
            </span>
            <span className="row-amount" style={{ width: 120, textAlign: "right" }}>
              {formatFcfa(montantProposeCategorie(revenu, percents[c.name] ?? 0))}
            </span>
          </div>
        ))}
      </div>

      <div className="seg" style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "var(--surface-2)", margin: "16px 0 8px" }}>
        {DEFAULT_CATEGORIES.map((c) => {
          const pct = percents[c.name] ?? 0;
          const width = totalPercent > 100 ? (pct / totalPercent) * 100 : pct;
          return (
            <span
              key={c.name}
              style={{ width: `${width}%`, background: `var(--${c.color})` }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      <p
        className="caption"
        role="status"
        aria-live="polite"
        style={{ color: totalPercent > 100 ? "var(--over)" : undefined }}
      >
        {totalMessage}
      </p>
    </div>
  );
}
