"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { categoryClass } from "@/lib/categories";
import { ecartLigne } from "@/lib/calculations";
import { formatMontant } from "@/lib/format";
import { addToQueue } from "@/lib/offlineQueue";
import { useMediaQuery } from "@/lib/useMediaQuery";

export interface CategoryOption {
  id: string;
  name: string;
  kind: string;
}

export interface LineData {
  id: string;
  name: string;
  planned: number;
  actual: number | null;
  isFixed: boolean;
  countsInProjection: boolean;
  categoryId: string;
}

interface LineFormProps {
  mode: "create" | "edit";
  initial?: LineData;
  categories: CategoryOption[];
  defaultCategoryId: string;
  onSaved: () => void;
  onDeleted?: (line: LineData) => void;
  onCancel: () => void;
}

function digitsOnly(raw: string): number {
  const v = raw.replace(/\D/g, "").slice(0, 9);
  return v ? parseInt(v, 10) : 0;
}

/**
 * Formulaire d'ajout/modification d'une ligne (section "Ajouter ou
 * modifier une ligne" du handoff), fidèle à `Ajout.dc.html` /
 * `Ajout-Mobile.dc.html` — deux expériences vraiment différentes, pas
 * juste une mise en page qui s'adapte : bureau a un montant géant en
 * saisie libre, des puces de catégorie et l'interrupteur "Revient chaque
 * mois" ; mobile a un pavé numérique dédié (le champ actif se touche pour
 * y taper), une catégorie qu'on fait défiler, et pas d'interrupteur
 * récurrence (absent de la maquette mobile).
 */
export function LineForm({ mode, initial, categories, defaultCategoryId, onSaved, onDeleted, onCancel }: LineFormProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [name, setName] = useState(initial?.name ?? "");
  const [planned, setPlanned] = useState(initial?.planned ?? 0);
  const [actual, setActual] = useState(initial?.actual ?? 0);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId);
  const [isFixed, setIsFixed] = useState(initial?.isFixed ?? false);
  const [countsInProjection, setCountsInProjection] = useState(initial?.countsInProjection ?? false);
  const [target, setTarget] = useState<"planned" | "actual">("planned");
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const amountErr = planned <= 0 && touched;
  const showGap = actual > 0 && planned > 0;
  const ecart = showGap ? ecartLigne({ categoryId, planned, actual }) : null;
  const gapText =
    ecart === null
      ? ""
      : ecart === 0
        ? "Pile sur le prévu"
        : `${formatMontant(Math.abs(ecart))} FCFA ${ecart > 0 ? "sous le prévu" : "au-dessus du prévu"}`;
  const gapClass = ecart === null ? "" : ecart > 0 ? "t-income" : ecart < 0 ? "t-over" : "t-muted";

  async function submit() {
    setErrors({});
    setTouched(true);
    if (!name.trim()) {
      setErrors({ name: "Ce champ est obligatoire." });
      return;
    }
    if (planned <= 0) {
      setErrors({ planned: "Entre un montant supérieur à 0." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        planned,
        actual: actual > 0 ? actual : null,
        categoryId,
        isFixed,
        countsInProjection,
      };
      let res: Response;
      try {
        res = await fetch(mode === "create" ? "/api/lignes" : `/api/lignes/${initial!.id}`, {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // `fetch` lève (TypeError), pas une réponse HTTP : pas de réseau.
        // Hors ligne, seul l'ajout d'une ligne est mis en file (règle du
        // handoff — la modification exige le réseau).
        if (mode === "create") {
          addToQueue(payload);
          onSaved();
          return;
        }
        setErrors({ _global: "Cette action nécessite une connexion. Réessaie une fois en ligne." });
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { _global: "Une erreur est survenue." });
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!initial) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lignes/${initial.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) onDeleted?.(data.line as LineData);
    } finally {
      setSubmitting(false);
    }
  }

  const deleteConfirmBlock = confirmingDelete ? (
    <div
      role="alertdialog"
      aria-label="Confirmer la suppression"
      className="card stack"
      style={{ marginTop: "var(--space-4)", gap: "var(--space-3)", background: "var(--surface-2)" }}
    >
      <div className="row-title">Supprimer « {initial?.name} » ?</div>
      <div className="caption">Tu pourras annuler juste après.</div>
      <div className="wrap" style={{ justifyContent: "flex-end" }}>
        <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
          Garder la ligne
        </Button>
        <Button variant="solid-ink" size="sm" onClick={doDelete} disabled={submitting}>
          Supprimer
        </Button>
      </div>
    </div>
  ) : null;

  if (!isDesktop) {
    // --- Feuille du bas, pavé numérique (Ajout-Mobile.dc.html) -----------
    const current = target === "planned" ? planned : actual;
    function setCurrent(n: number) {
      if (target === "planned") {
        setPlanned(n);
        setTouched(true);
      } else {
        setActual(n);
      }
    }
    function press(digits: string) {
      setCurrent(digitsOnly(String(current || "") + digits));
    }
    function backspace() {
      const s = String(current).slice(0, -1);
      setCurrent(s ? parseInt(s, 10) : 0);
    }
    function cycleCategory() {
      const i = categories.findIndex((c) => c.id === categoryId);
      setCategoryId(categories[(i + 1) % categories.length]?.id ?? categoryId);
    }

    return (
      <div>
        {errors._global ? (
          <p role="alert" className="field-error" style={{ marginBottom: "var(--space-3)" }}>
            {errors._global}
          </p>
        ) : null}

        <div className="field">
          <label className="muted" htmlFor="nom-m">
            Nom
          </label>
          <input
            id="nom-m"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              border: 0,
              background: "transparent",
              outline: "none",
              textAlign: "right",
              color: "var(--ink)",
              font: "inherit",
              minHeight: 44,
              minWidth: 0,
              flex: 1,
            }}
          />
        </div>
        {errors.name ? (
          <div className="field-error" role="alert" style={{ padding: "0 var(--space-2)" }}>
            {errors.name}
          </div>
        ) : null}

        <button
          type="button"
          className="field"
          aria-pressed={target === "planned"}
          onClick={() => setTarget("planned")}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: target === "planned" ? "var(--accent-soft)" : "transparent",
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            color: "var(--ink)",
            font: "inherit",
            cursor: "pointer",
            minHeight: 56,
            paddingInline: "var(--space-2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="muted">Prévu</span>
          <span className="t-md" aria-live="polite">
            {formatMontant(planned)} FCFA
          </span>
        </button>
        {amountErr ? (
          <div className="field-error" role="alert" style={{ padding: "0 var(--space-2)" }}>
            Entre un montant supérieur à 0.
          </div>
        ) : null}

        <button
          type="button"
          className="field"
          aria-pressed={target === "actual"}
          onClick={() => setTarget("actual")}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: target === "actual" ? "var(--accent-soft)" : "transparent",
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            color: "var(--ink)",
            font: "inherit",
            cursor: "pointer",
            minHeight: 56,
            paddingInline: "var(--space-2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="muted">Dépensé · facultatif</span>
          <span className="t-md" aria-live="polite">
            {actual > 0 ? `${formatMontant(actual)} FCFA` : "Pas encore"}
          </span>
        </button>
        {showGap ? (
          <div className={`caption ${gapClass}`} aria-live="polite" style={{ fontWeight: 600, padding: "0 var(--space-2)" }}>
            Écart : {gapText}
          </div>
        ) : null}

        <button
          type="button"
          className="field"
          onClick={cycleCategory}
          aria-label="Changer de catégorie"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "transparent",
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            color: "var(--ink)",
            font: "inherit",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          <span className="muted">Catégorie</span>
          <span className="wrap">
            <span className={`dot ${categoryClass(selectedCategory?.kind ?? "")}`} />
            {selectedCategory?.name}
          </span>
        </button>

        <div className="keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} type="button" className="key" aria-label={d} onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="key" aria-label="Effacer" onClick={backspace}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6h10a1 1 0 011 1v10a1 1 0 01-1 1H9l-6-6zM12 10l4 4M16 10l-4 4" />
            </svg>
          </button>
          <button type="button" className="key" aria-label="0" onClick={() => press("0")}>
            0
          </button>
          <button type="button" className="key" aria-label="Trois zéros" onClick={() => press("000")}>
            000
          </button>
        </div>

        {deleteConfirmBlock}

        <div className="stack" style={{ marginTop: "var(--space-4)", gap: "var(--space-2)" }}>
          <Button block onClick={submit} disabled={submitting}>
            {mode === "edit" ? "Enregistrer" : "Confirmer"}
          </Button>
          {mode === "edit" && !confirmingDelete ? (
            <Button variant="quiet" block onClick={() => setConfirmingDelete(true)}>
              Supprimer la ligne
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  // --- Dialogue bureau (Ajout.dc.html) ------------------------------------
  return (
    <div>
      {errors._global ? (
        <p role="alert" className="field-error" style={{ marginBottom: "var(--space-3)" }}>
          {errors._global}
        </p>
      ) : null}

      <div className="field-box">
        <label className="label" htmlFor="nom">
          Nom
        </label>
        <input id="nom" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? "true" : undefined} />
        {errors.name ? (
          <div className="field-error" role="alert">
            {errors.name}
          </div>
        ) : null}
      </div>

      <div className="field-box" style={{ marginTop: "var(--space-4)" }}>
        <label className="label" htmlFor="amt">
          Montant prévu
        </label>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
          <input
            id="amt"
            className="t-xl"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={planned ? formatMontant(planned) : ""}
            onChange={(e) => {
              setPlanned(digitsOnly(e.target.value));
              setTouched(true);
            }}
            placeholder="0"
            aria-invalid={amountErr ? "true" : undefined}
            aria-describedby="amt-err"
            style={{ border: 0, background: "transparent", outline: "none", padding: 0, minWidth: 0, width: "100%", color: "var(--ink)" }}
          />
          <span className="t-md muted">FCFA</span>
        </div>
        {amountErr ? (
          <div id="amt-err" className="field-error" role="alert">
            Entre un montant supérieur à 0.
          </div>
        ) : null}
      </div>

      <div className="field-box" style={{ marginTop: "var(--space-4)" }}>
        <label className="label" htmlFor="reel">
          Dépensé (réel) <span className="caption" style={{ textTransform: "none", letterSpacing: 0 }}>· facultatif</span>
        </label>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
          <input
            id="reel"
            className="input input-amount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Pas encore dépensé"
            value={actual ? formatMontant(actual) : ""}
            onChange={(e) => setActual(digitsOnly(e.target.value))}
          />
          <span className="muted">FCFA</span>
        </div>
        {showGap ? (
          <div className={`caption ${gapClass}`} aria-live="polite" style={{ fontWeight: 600 }}>
            Écart : {gapText}
          </div>
        ) : null}
      </div>

      <div className="field-box" style={{ marginTop: "var(--space-4)" }}>
        <span className="label" id="cat-label">
          Catégorie
        </span>
        <div className="wrap" role="group" aria-labelledby="cat-label">
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
              <span className={`dot ${categoryClass(c.kind)}`} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginTop: "var(--space-3)" }}>
        <span>Revient chaque mois</span>
        <Switch checked={isFixed} onChange={setIsFixed} label="Revient chaque mois" />
      </div>

      {selectedCategory?.kind === "SAVINGS" ? (
        <div className="field">
          <span>Compte dans la projection</span>
          <Switch checked={countsInProjection} onChange={setCountsInProjection} label="Compte dans la projection" />
        </div>
      ) : null}

      {deleteConfirmBlock}

      <div className="wrap" style={{ marginTop: "var(--space-4)", justifyContent: "space-between", flexWrap: "nowrap" }}>
        {mode === "edit" && !confirmingDelete ? (
          <Button variant="quiet" size="sm" onClick={() => setConfirmingDelete(true)}>
            Supprimer la ligne
          </Button>
        ) : (
          <span />
        )}
        <div className="wrap" style={{ marginLeft: "auto", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button size="sm" onClick={submit} disabled={submitting}>
            {mode === "edit" ? "Enregistrer" : "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
