"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { IconCheck, IconEpargne, IconPlus } from "@/components/ui/Icons";
import { projection } from "@/lib/calculations";
import { formatMontant } from "@/lib/format";

interface Account {
  id: string;
  name: string;
  balance: number;
  monthlyContribution: number;
  isLocked: boolean;
  includeInProjection: boolean;
}

const HORIZONS = [1, 3, 6, 12, 24];
const MOIS_ABREGES = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

/** Épargne et projection — fidèle à `Epargne.dc.html`. */
export function EpargneManager({
  accounts,
  epargneMensuelle,
  fondsUrgenceMois,
  totalDepense,
  initialMontant,
}: {
  accounts: Account[];
  epargneMensuelle: number;
  fondsUrgenceMois: number;
  totalDepense: number;
  initialMontant?: number;
}) {
  const router = useRouter();
  const [horizon, setHorizon] = useState(3);
  const [view, setView] = useState<"chart" | "table">("chart");
  const [adding, setAdding] = useState(() => Boolean(initialMontant));
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<number | "">(() => initialMontant ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [soldeDrafts, setSoldeDrafts] = useState<Record<string, number>>({});

  const accountsLike = accounts.map((a) => ({
    balance: soldeDrafts[a.id] ?? a.balance,
    includeInProjection: a.includeInProjection,
  }));
  const soldesAll = accounts.reduce((s, a) => s + (soldeDrafts[a.id] ?? a.balance), 0);

  const now = new Date();
  const rows = Array.from({ length: horizon }, (_, i) => {
    const mois = i + 1;
    const d = new Date(now.getFullYear(), now.getMonth() + mois, 1);
    return {
      mois,
      label: MOIS_ABREGES[d.getMonth()],
      verse: epargneMensuelle,
      cumul: projection(epargneMensuelle, accountsLike, mois),
    };
  });
  const total = rows.length > 0 ? rows[rows.length - 1].cumul : 0;
  const maxCumul = Math.max(1, total);

  const couverture = fondsUrgenceMois;
  const couverturePct = Math.min(100, Math.round((couverture / 3) * 100));
  const atteint = couverture >= 3;

  async function patchAccount(id: string, data: Record<string, unknown>) {
    await fetch(`/api/comptes-epargne/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  async function onAddAccount() {
    setError(null);
    if (!name.trim()) {
      setError("Donne un nom à ton compte.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/comptes-epargne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, balance: balance === "" ? 0 : balance, includeInProjection: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      setName("");
      setBalance("");
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div className="screen-head">
        <h1 className="screen-title">Épargne</h1>
        <div className="head-actions">
          {!adding ? (
            <Button size="sm" onClick={() => setAdding(true)}>
              <IconPlus />
              Ajouter un compte
            </Button>
          ) : null}
        </div>
      </div>

      <div className="cols-main">
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <section className="card stack c-savings" style={{ padding: "var(--space-6)" }}>
            <div className="label">Épargne dans {horizon} mois</div>
            <div className="t-xl" aria-live="polite">
              {formatMontant(total)}&nbsp;FCFA
            </div>
            <div className="caption">
              Soldes actuels des comptes inclus ({formatMontant(soldesAll)}&nbsp;FCFA) + {formatMontant(epargneMensuelle)}&nbsp;FCFA par mois
            </div>
            <div className="wrap" role="group" aria-label="Horizon de la projection">
              {HORIZONS.map((h) => (
                <button key={h} type="button" className="chip" aria-pressed={horizon === h} onClick={() => setHorizon(h)}>
                  {h} mois
                </button>
              ))}
            </div>
            <div className="pill-nav" role="group" aria-label="Affichage de la projection" style={{ alignSelf: "flex-start" }}>
              <button type="button" aria-pressed={view === "chart"} onClick={() => setView("chart")}>
                Courbe
              </button>
              <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>
                Tableau
              </button>
            </div>

            {view === "chart" ? (
              <div
                className="proj"
                role="img"
                aria-label={`Épargne cumulée sur ${horizon} mois : ${formatMontant(total)} FCFA au total`}
              >
                {rows.map((r) => (
                  <div className="proj-col" key={r.mois}>
                    <div className="proj-val">{horizon <= 6 || r.mois === horizon ? formatMontant(r.cumul) : ""}</div>
                    <div className="proj-bar" style={{ height: `${Math.max(8, Math.round((150 * r.cumul) / maxCumul))}px` }} />
                    <div className="caption">{r.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                <div className="table-head" style={{ gridTemplateColumns: "1fr 1fr 1fr", display: "grid" }}>
                  <span className="label">Mois</span>
                  <span className="label" style={{ textAlign: "right" }}>
                    Versé
                  </span>
                  <span className="label" style={{ textAlign: "right" }}>
                    Cumul
                  </span>
                </div>
                {rows.map((r) => (
                  <div key={r.mois} className="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
                    <span>{r.label}</span>
                    <span className="row-amount" style={{ textAlign: "right" }}>
                      +{formatMontant(r.verse)}
                    </span>
                    <span className="row-amount" style={{ textAlign: "right" }}>
                      {formatMontant(r.cumul)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="caption">
              Projection indicative : elle suppose le même versement chaque mois et aucun retrait.
            </div>
          </section>

          <section className="card stack">
            <div className="cat-head">
              <div className="row-icon c-savings">
                <IconEpargne />
              </div>
              <div className="row-main">
                <div className="row-title">Fonds d&apos;urgence</div>
                <div className="row-sub">Objectif : 3 mois de dépenses couverts</div>
              </div>
            </div>
            {soldesAll === 0 ? (
              <>
                <div className="caption">
                  Renseigne le solde de tes comptes pour voir combien de mois de dépenses ton épargne couvre.
                </div>
              </>
            ) : (
              <>
                <div className="t-lg" aria-live="polite">
                  {couverture.toFixed(1).replace(".", ",")} mois couverts
                </div>
                <div className={`meter ${atteint ? "ok" : "cat"}`} role="img" aria-label={`Couverture : ${couverturePct} % de l'objectif de 3 mois`}>
                  <span style={{ width: `${couverturePct}%` }} />
                </div>
                <div className="caption">
                  {formatMontant(soldesAll)}&nbsp;FCFA d&apos;épargne pour {formatMontant(totalDepense)} FCFA de dépenses par mois.{" "}
                  {atteint ? "Objectif atteint." : "Objectif : 3 mois."}
                </div>
                {atteint ? (
                  <div className="celebrate" role="status">
                    <div className="celebrate-icon">
                      <IconCheck />
                    </div>
                    <div className="row-main">
                      <div className="celebrate-title">Objectif atteint</div>
                      <div className="row-sub">Ton épargne couvre 3 mois de dépenses.</div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>

        <section className="stack c-savings">
          <h2 className="label" style={{ margin: 0 }}>
            Mes comptes d&apos;épargne
          </h2>
          {accounts.length === 0 ? (
            <div className="card">
              <p className="caption">Crée un premier compte pour voir ta projection évoluer.</p>
            </div>
          ) : (
            accounts.map((a) => (
              <div key={a.id} className="card stack">
                <div className="cat-head">
                  <div className="row-icon">
                    <IconEpargne />
                  </div>
                  <div className="row-main">
                    <div className="row-title">{a.name}</div>
                    <div className="row-sub">
                      {a.isLocked ? (
                        <span className="tag">Bloqué</span>
                      ) : (
                        `Versement mensuel`
                      )}
                    </div>
                  </div>
                  <div className="t-md">{formatMontant(a.monthlyContribution)}&nbsp;FCFA</div>
                </div>
                <div className="field-box" style={{ marginTop: "var(--space-2)" }}>
                  <label className="label" htmlFor={`sol-${a.id}`}>
                    Solde actuel, en FCFA
                  </label>
                  <input
                    id={`sol-${a.id}`}
                    className="input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Non renseigné"
                    value={soldeDrafts[a.id] !== undefined ? formatMontant(soldeDrafts[a.id]) : a.balance ? formatMontant(a.balance) : ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setSoldeDrafts((prev) => ({ ...prev, [a.id]: v ? parseInt(v, 10) : 0 }));
                    }}
                    onBlur={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      patchAccount(a.id, { balance: v ? parseInt(v, 10) : 0 });
                    }}
                  />
                </div>
                <div className="field" style={{ paddingBottom: 0 }}>
                  <span>Compte dans la projection</span>
                  <Switch
                    checked={a.includeInProjection}
                    onChange={(v) => patchAccount(a.id, { includeInProjection: v })}
                    label={`${a.name} compte dans la projection`}
                  />
                </div>
              </div>
            ))
          )}

          {adding ? (
            <form className="inline-form" onSubmit={(e) => e.preventDefault()} aria-labelledby="nf-t">
              <h3 id="nf-t" className="screen-title" style={{ margin: 0, fontSize: 18 }}>
                Nouveau compte d&apos;épargne
              </h3>
              {initialMontant ? (
                <div className="caption">
                  Montant repris du restant de ton mois ({formatMontant(initialMontant)}&nbsp;FCFA) — modifie-le si besoin.
                </div>
              ) : null}
              <Field label="Nom du compte" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Tontine" error={error} />
              <Field
                label="Solde actuel, en FCFA"
                type="number"
                inputMode="numeric"
                amount
                value={balance}
                onChange={(e) => setBalance(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="wrap" style={{ justifyContent: "flex-end" }}>
                <Button variant="secondary" size="sm" type="button" onClick={() => setAdding(false)}>
                  Annuler
                </Button>
                <Button size="sm" type="button" onClick={onAddAccount} disabled={submitting}>
                  Ajouter
                </Button>
              </div>
            </form>
          ) : null}

          <div className="caption" aria-live="polite">
            {accounts.some((a) => a.isLocked && !a.includeInProjection)
              ? `Le compte bloqué est exclu par défaut : ${formatMontant(epargneMensuelle)} FCFA comptés sur ${formatMontant(accounts.reduce((s, a) => s + a.monthlyContribution, 0))} FCFA versés chaque mois. Active-le si tu veux l'inclure.`
              : "Tous tes comptes comptent dans la projection."}
          </div>
          <div className="caption">
            Épargne mensuelle comptée dans la projection :{" "}
            <strong className="amount" style={{ color: "var(--ink)" }}>
              {formatMontant(epargneMensuelle)}&nbsp;FCFA
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}
