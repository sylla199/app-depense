"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { projection } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

interface Account {
  id: string;
  name: string;
  balance: number;
  monthlyContribution: number;
  isLocked: boolean;
  includeInProjection: boolean;
}

const HORIZONS = [1, 3, 6, 12, 24];

export function EpargneManager({
  accounts,
  epargneMensuelle,
  fondsUrgenceMois,
}: {
  accounts: Account[];
  epargneMensuelle: number;
  fondsUrgenceMois: number;
}) {
  const router = useRouter();
  const [horizon, setHorizon] = useState(3);
  const [view, setView] = useState<"tableau" | "courbe">("tableau");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<number | "">(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number | "">(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const accountsLike = accounts.map((a) => ({
    balance: a.balance,
    includeInProjection: a.includeInProjection,
  }));

  const rows = useMemo(
    () =>
      Array.from({ length: horizon }, (_, i) => {
        const mois = i + 1;
        return { mois, verse: epargneMensuelle, cumul: projection(epargneMensuelle, accountsLike, mois) };
      }),
    [horizon, epargneMensuelle, accountsLike]
  );

  const totalHorizon = projection(epargneMensuelle, accountsLike, horizon);
  const urgenceAtteint = fondsUrgenceMois >= 3;
  const maxCumul = rows.length > 0 ? rows[rows.length - 1].cumul : 0;

  async function onAddAccount() {
    setError(null);
    if (!name.trim()) {
      setError("Ce champ est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/comptes-epargne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          balance: balance === "" ? 0 : balance,
          monthlyContribution: monthlyContribution === "" ? 0 : monthlyContribution,
          includeInProjection: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      setName("");
      setBalance(0);
      setMonthlyContribution(0);
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleInclude(account: Account) {
    await fetch(`/api/comptes-epargne/${account.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeInProjection: !account.includeInProjection }),
    });
    router.refresh();
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 className="t-lg" style={{ margin: 0 }}>
        Épargne
      </h1>

      <div className="card card-lg">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p className="label" style={{ margin: 0 }}>
            Épargne dans {horizon} {horizon > 1 ? "mois" : "mois"}
          </p>
          <div className="pill-nav" role="tablist" aria-label="Horizon">
            {HORIZONS.map((h) => (
              <button
                key={h}
                type="button"
                role="tab"
                aria-selected={horizon === h}
                onClick={() => setHorizon(h)}
              >
                {h}m
              </button>
            ))}
          </div>
        </div>
        <p className="t-xl amount" style={{ margin: "12px 0" }}>
          {formatFcfa(totalHorizon)}
        </p>
        <p className="caption">
          Projection indicative : elle suppose le même versement chaque mois et aucun retrait.
        </p>

        <div className="pill-nav" role="tablist" aria-label="Affichage" style={{ margin: "16px 0" }}>
          <button type="button" role="tab" aria-selected={view === "tableau"} onClick={() => setView("tableau")}>
            Tableau
          </button>
          <button type="button" role="tab" aria-selected={view === "courbe"} onClick={() => setView("courbe")}>
            Graphique
          </button>
        </div>

        {view === "tableau" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <caption className="caption" style={{ position: "absolute", left: -9999 }}>
              Projection d&apos;épargne mois par mois
            </caption>
            <thead>
              <tr>
                <th scope="col" className="caption" style={{ textAlign: "left", padding: "4px 0" }}>
                  Mois
                </th>
                <th scope="col" className="caption" style={{ textAlign: "right", padding: "4px 0" }}>
                  Versé
                </th>
                <th scope="col" className="caption" style={{ textAlign: "right", padding: "4px 0" }}>
                  Cumul
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mois} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 0" }}>Mois {r.mois}</td>
                  <td className="row-amount" style={{ padding: "8px 0", textAlign: "right" }}>
                    {formatFcfa(r.verse)}
                  </td>
                  <td className="row-amount" style={{ padding: "8px 0", textAlign: "right" }}>
                    {formatFcfa(r.cumul)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            role="img"
            aria-label={`Courbe de projection de ${formatFcfa(epargneMensuelle)} par mois jusqu'à ${formatFcfa(totalHorizon)} à ${horizon} mois`}
            style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}
          >
            {rows.map((r) => (
              <div key={r.mois} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    background: "var(--accent)",
                    borderRadius: "4px 4px 0 0",
                    height: maxCumul > 0 ? `${Math.max(4, (r.cumul / maxCumul) * 110)}px` : 4,
                    transition: "height 300ms ease-out",
                  }}
                />
                <span className="caption">{r.mois}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>
          Fonds d&apos;urgence
        </p>
        <p className="t-md amount" style={{ margin: "0 0 4px" }}>
          {fondsUrgenceMois.toFixed(1)} mois de dépenses couverts
        </p>
        <div className={`meter ${urgenceAtteint ? "ok" : ""}`}>
          <span style={{ width: `${Math.min(100, (fondsUrgenceMois / 3) * 100)}%` }} />
        </div>
        <p className="caption" style={{ margin: "8px 0 0" }}>
          Objectif : 3 mois.
        </p>
        {urgenceAtteint ? (
          <div className="celebrate" role="status" style={{ marginTop: 12 }}>
            🎉 Objectif de fonds d&apos;urgence atteint.
          </div>
        ) : null}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 className="label" style={{ margin: 0 }}>
            Comptes d&apos;épargne
          </h2>
        </div>
        {accounts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <p className="caption">Crée un premier compte pour voir ta projection évoluer.</p>
          </div>
        ) : (
          <div className="card">
            {accounts.map((a) => (
              <div key={a.id} className="row">
                <div className="row-main">
                  <p className="row-title" style={{ margin: 0 }}>
                    {a.name} {a.isLocked ? <span className="caption">· Bloqué</span> : null}
                  </p>
                  <p className="row-sub" style={{ margin: 0 }}>
                    Versement mensuel {formatFcfa(a.monthlyContribution)}
                  </p>
                </div>
                <div className="row-end" style={{ gap: 16 }}>
                  <span className="row-amount">{formatFcfa(a.balance)}</span>
                  <Switch
                    checked={a.includeInProjection}
                    onChange={() => toggleInclude(a)}
                    label={`Compte dans la projection pour ${a.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {accounts.some((a) => !a.includeInProjection) ? (
          <p className="caption" style={{ marginTop: 8 }}>
            Un compte « Compte dans la projection » désactivé n&apos;ajoute pas son solde à la
            projection ci-dessus (c&apos;est le cas par défaut pour un compte bloqué).
          </p>
        ) : null}
      </div>

      {adding ? (
        <Modal title="Ajouter un compte" onClose={() => setAdding(false)}>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error ? (
              <p role="alert" className="field-error">
                {error}
              </p>
            ) : null}
            <Field label="Nom du compte" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Djamo" />
            <Field
              label="Solde actuel"
              type="number"
              inputMode="numeric"
              amount
              value={balance}
              onChange={(e) => setBalance(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Field
              label="Versement mensuel"
              type="number"
              inputMode="numeric"
              amount
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setAdding(false)}>
                Annuler
              </Button>
              <Button block onClick={onAddAccount} disabled={submitting}>
                Ajouter
              </Button>
            </div>
          </div>
        </Modal>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)}>
          Ajouter un compte
        </Button>
      )}
    </div>
  );
}
