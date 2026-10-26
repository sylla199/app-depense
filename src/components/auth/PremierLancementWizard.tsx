"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { montantProposeCategorie } from "@/lib/calculations";
import { formatFcfa, formatMontant } from "@/lib/format";

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  defaultPercent: number;
}

function digitsOnly(raw: string, maxLength = 9): number {
  const v = raw.replace(/\D/g, "").slice(0, maxLength);
  return v ? parseInt(v, 10) : 0;
}

/**
 * Parcours guidé en 3 étapes (F10, Must) — fidèle à `Onboarding.dc.html` :
 * revenu du mois, répartition type (informative, ajustable ensuite ligne
 * par ligne dans l'app), première ligne de dépense. Objectif du cahier des
 * charges : moins de 5 minutes sans documentation.
 */
export function PremierLancementWizard({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [revenu, setRevenu] = useState(0);
  // Seules les catégories dont le montant a été modifié à la main sont
  // retenues ici ; les autres suivent la proposition par défaut (% du
  // revenu) et se réajustent automatiquement si le revenu change à l'étape 1.
  const [montantsEdites, setMontantsEdites] = useState<Record<string, number>>({});
  const [ligneName, setLigneName] = useState("");
  const [lignePlanned, setLignePlanned] = useState(0);
  const [ligneCategoryId, setLigneCategoryId] = useState(categories[0]?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function montantCategorie(c: CategoryOption): number {
    return montantsEdites[c.id] ?? montantProposeCategorie(revenu, c.defaultPercent);
  }
  function pctCategorie(c: CategoryOption): number {
    return revenu > 0 ? Math.round((montantCategorie(c) / revenu) * 100) : 0;
  }

  const totalMontant = categories.reduce((sum, c) => sum + montantCategorie(c), 0);
  const reste = revenu - totalMontant;
  const pctAlloue = revenu > 0 ? Math.round((totalMontant / revenu) * 100) : 0;
  const meterCls = reste < 0 ? "over" : reste === 0 ? "ok" : "";
  const resteLabel = reste === 0 ? "Chaque franc est affecté" : reste > 0 ? "Reste à répartir" : "Dépassement";
  const resteCouleur = reste < 0 ? "var(--over)" : reste === 0 ? "var(--income)" : "var(--ink)";

  async function onFinish() {
    setErrors({});
    if (lignePlanned <= 0) {
      setErrors({ planned: "Entre un montant supérieur à 0." });
      return;
    }
    if (!ligneName.trim()) {
      setErrors({ name: "Ce champ est obligatoire." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/premier-lancement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revenu,
          premiereLigne: { name: ligneName, planned: lignePlanned, categoryId: ligneCategoryId },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { _global: "Une erreur est survenue." });
        return;
      }
      router.push("/mois");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="onb">
      <div className="onb-card">
        <div className="screen-head">
          <div className="topnav-brand">
            <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
            Dépenses
          </div>
          <div className="step-dots" role="img" aria-label={`Étape ${step} sur 3`}>
            <span className="on" />
            <span className={step >= 2 ? "on" : ""} />
            <span className={step >= 3 ? "on" : ""} />
          </div>
        </div>

        {step === 1 ? (
          <section className="stack" style={{ gap: "var(--space-6)" }}>
            <div className="stack" style={{ gap: "var(--space-2)" }}>
              <div className="label">Étape 1 sur 3</div>
              <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
                Quel est ton revenu du mois ?
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                Salaire et autres revenus. Tu pourras ajouter d&apos;autres sources plus tard.
              </p>
            </div>
            <div className="amount-field">
              <label className="sr" htmlFor="rev">
                Revenu du mois en FCFA
              </label>
              <input
                id="rev"
                className="t-xl"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={revenu ? formatMontant(revenu) : ""}
                onChange={(e) => setRevenu(digitsOnly(e.target.value))}
              />
              <span className="t-md muted">FCFA</span>
            </div>
            <Button block onClick={() => setStep(2)} disabled={revenu === 0}>
              Continuer
            </Button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="stack" style={{ gap: "var(--space-6)" }}>
            <div className="stack" style={{ gap: "var(--space-2)" }}>
              <div className="label">Étape 2 sur 3</div>
              <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
                Répartis ton revenu
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                Voici une proposition de départ. Ajuste-la dès maintenant si tu veux, ou change
                chaque montant plus tard, ligne par ligne.
              </p>
            </div>
            <div className="card stack" style={{ gap: "var(--space-2)" }}>
              <div className="label">{resteLabel}</div>
              <div className="t-xl" style={{ color: resteCouleur }}>
                {formatFcfa(Math.abs(reste))}
              </div>
              <div
                className={`meter ${meterCls}`}
                role="img"
                aria-label={`${pctAlloue} % du revenu réparti`}
              >
                <span style={{ width: `${Math.min(100, pctAlloue)}%` }} />
              </div>
              <div className="caption" style={{ marginBottom: "var(--space-2)" }}>
                {pctAlloue} % réparti · revenu du mois : {formatFcfa(revenu)}
              </div>

              <div className="stack" style={{ gap: "var(--space-3)" }}>
                {categories.map((c) => (
                  <div key={c.id} className="sim-row" style={{ gridTemplateColumns: "auto minmax(0,1fr) 44px 130px" }}>
                    <span className="dot" style={{ "--c": `var(--${c.color})` } as CSSProperties} />
                    <label htmlFor={`onb-montant-${c.id}`}>{c.name}</label>
                    <span className="caption" style={{ textAlign: "right" }}>
                      {pctCategorie(c)} %
                    </span>
                    <input
                      id={`onb-montant-${c.id}`}
                      className="pct-input"
                      style={{ width: 130, textAlign: "right" }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={montantCategorie(c) ? formatMontant(montantCategorie(c)) : ""}
                      placeholder="0"
                      onChange={(e) =>
                        setMontantsEdites((prev) => ({ ...prev, [c.id]: digitsOnly(e.target.value) }))
                      }
                      aria-label={`${c.name}, montant en FCFA`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="wrap" style={{ flexWrap: "nowrap" }}>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button style={{ flex: 1 }} onClick={() => setStep(3)}>
                Continuer
              </Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="stack" style={{ gap: "var(--space-6)" }}>
            <div className="stack" style={{ gap: "var(--space-2)" }}>
              <div className="label">Étape 3 sur 3</div>
              <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
                Ajoute ta première ligne
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                Une dépense, un montant, une catégorie. Les totaux se mettent à jour tout seuls.
              </p>
            </div>
            <div className="card stack" style={{ gap: "var(--space-4)" }}>
              {errors._global ? (
                <p role="alert" className="field-error">
                  {errors._global}
                </p>
              ) : null}
              <div className="field-box">
                <label className="label" htmlFor="nom">
                  Nom
                </label>
                <input
                  id="nom"
                  className="input"
                  type="text"
                  placeholder="Ex. Internet"
                  value={ligneName}
                  onChange={(e) => setLigneName(e.target.value)}
                />
                {errors.name ? (
                  <div className="field-error" role="alert">
                    {errors.name}
                  </div>
                ) : null}
              </div>
              <div className="field-box">
                <label className="label" htmlFor="mt">
                  Montant, en FCFA
                </label>
                <input
                  id="mt"
                  className="input input-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={lignePlanned ? formatMontant(lignePlanned) : ""}
                  onChange={(e) => setLignePlanned(digitsOnly(e.target.value))}
                />
                {errors.planned ? (
                  <div className="field-error" role="alert">
                    {errors.planned}
                  </div>
                ) : null}
              </div>
              <div className="field-box">
                <span className="label" id="cl">
                  Catégorie
                </span>
                <div className="wrap" role="group" aria-labelledby="cl">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="chip"
                      aria-pressed={ligneCategoryId === c.id}
                      onClick={() => setLigneCategoryId(c.id)}
                    >
                      <span className="dot" style={{ "--c": `var(--${c.color})` } as CSSProperties} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="wrap" style={{ flexWrap: "nowrap" }}>
              <Button variant="secondary" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button style={{ flex: 1 }} onClick={onFinish} disabled={submitting}>
                {submitting ? "…" : "Voir mon mois"}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
