"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { montantProposeCategorie } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  defaultPercent: number;
}

/**
 * Parcours guidé en 3 étapes (F10, Must) : revenu du mois, répartition type
 * (informative, ajustable ensuite ligne par ligne dans l'app), première
 * ligne de dépense. Objectif du cahier des charges : moins de 5 minutes
 * sans documentation.
 */
export function PremierLancementWizard({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [revenu, setRevenu] = useState(880000);
  const [percents, setPercents] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.defaultPercent]))
  );
  const [ligneName, setLigneName] = useState("");
  const [lignePlanned, setLignePlanned] = useState<number | "">("");
  const [ligneCategoryId, setLigneCategoryId] = useState(categories[0]?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  async function onFinish() {
    setErrors({});
    if (typeof lignePlanned !== "number" || lignePlanned <= 0) {
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
    <div className="card card-lg" style={{ maxWidth: 480, margin: "48px auto" }}>
      <p className="caption" style={{ marginBottom: 4 }}>
        Étape {step} sur 3
      </p>
      <div className="meter" style={{ marginBottom: 24 }}>
        <span style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {step === 1 ? (
        <>
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Quel est ton revenu ce mois-ci ?
          </h1>
          <Field
            label="Revenu du mois"
            type="number"
            inputMode="numeric"
            amount
            value={revenu}
            onChange={(e) => setRevenu(Number(e.target.value) || 0)}
          />
          <Button block onClick={() => setStep(2)} style={{ marginTop: 16 }}>
            Continuer
          </Button>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Comment veux-tu le répartir ?
          </h1>
          <p className="caption">Une proposition de départ — tu ajusteras ligne par ligne ensuite.</p>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
            {categories.map((c) => (
              <div key={c.id} className="field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="dot" style={{ "--c": `var(--${c.color})` } as CSSProperties} />
                <span style={{ flex: 1 }}>{c.name}</span>
                <input
                  type="number"
                  className="input"
                  style={{ width: 72, textAlign: "right" }}
                  value={percents[c.id] ?? 0}
                  onChange={(e) =>
                    setPercents((prev) => ({ ...prev, [c.id]: Number(e.target.value) || 0 }))
                  }
                  aria-label={`Pourcentage pour ${c.name}`}
                />
                <span className="caption" style={{ width: 16 }}>%</span>
                <span className="row-amount" style={{ width: 110, textAlign: "right" }}>
                  {formatFcfa(montantProposeCategorie(revenu, percents[c.id] ?? 0))}
                </span>
              </div>
            ))}
          </div>
          <p
            className="caption"
            role="status"
            aria-live="polite"
            style={{ color: totalPercent > 100 ? "var(--over)" : undefined }}
          >
            {totalMessage}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Retour
            </Button>
            <Button block onClick={() => setStep(3)}>
              Continuer
            </Button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Ajoute ta première ligne
          </h1>
          {errors._global ? (
            <p role="alert" className="field-error">
              {errors._global}
            </p>
          ) : null}
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field
              label="Nom"
              value={ligneName}
              onChange={(e) => setLigneName(e.target.value)}
              error={errors.name}
              placeholder="Ex. Internet"
            />
            <Field
              label="Montant prévu"
              type="number"
              inputMode="numeric"
              amount
              value={lignePlanned}
              onChange={(e) => setLignePlanned(e.target.value === "" ? "" : Number(e.target.value))}
              error={errors.planned}
            />
            <div className="field-box">
              <label className="label" htmlFor="categorie-premiere-ligne">
                Catégorie
              </label>
              <select
                id="categorie-premiere-ligne"
                className="input"
                value={ligneCategoryId}
                onChange={(e) => setLigneCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setStep(2)}>
              Retour
            </Button>
            <Button block onClick={onFinish} disabled={submitting}>
              {submitting ? "…" : "Créer mon premier mois"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
