"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { ecartLigne } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

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

/**
 * Formulaire d'ajout/modification d'une ligne (section "Ajouter ou modifier
 * une ligne"). Rendu dans une `Modal` (feuille du bas sur mobile, dialogue
 * sur bureau/tablette — bascule CSS, pas de duplication de composant).
 */
export function LineForm({ mode, initial, categories, defaultCategoryId, onSaved, onDeleted, onCancel }: LineFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [planned, setPlanned] = useState<number | "">(initial?.planned ?? "");
  const [actual, setActual] = useState<number | "">(initial?.actual ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId);
  const [isFixed, setIsFixed] = useState(initial?.isFixed ?? false);
  const [countsInProjection, setCountsInProjection] = useState(initial?.countsInProjection ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const ecart = typeof planned === "number" && typeof actual === "number" ? ecartLigne({ categoryId, planned, actual }) : null;

  async function onSubmit() {
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: "Ce champ est obligatoire." });
      return;
    }
    if (typeof planned !== "number" || planned <= 0) {
      setErrors({ planned: "Entre un montant supérieur à 0." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        planned,
        actual: actual === "" ? null : actual,
        categoryId,
        isFixed,
        countsInProjection,
      };
      const res = await fetch(mode === "create" ? "/api/lignes" : `/api/lignes/${initial!.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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

  async function onDelete() {
    if (!initial) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lignes/${initial.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        onDeleted?.(data.line as LineData);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {errors._global ? (
        <p role="alert" className="field-error">
          {errors._global}
        </p>
      ) : null}

      <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />

      <Field
        label="Montant prévu"
        type="number"
        inputMode="numeric"
        amount
        value={planned}
        onChange={(e) => setPlanned(e.target.value === "" ? "" : Number(e.target.value))}
        error={errors.planned}
      />

      <div>
        <Field
          label="Dépensé réel (facultatif)"
          type="number"
          inputMode="numeric"
          amount
          value={actual}
          onChange={(e) => setActual(e.target.value === "" ? "" : Number(e.target.value))}
        />
        {ecart !== null ? (
          <p className="caption" aria-live="polite" style={{ marginTop: 4 }}>
            Écart :{" "}
            {ecart === 0
              ? "Pile sur le prévu"
              : ecart > 0
                ? `${formatFcfa(ecart)} sous le prévu`
                : `${formatFcfa(Math.abs(ecart))} au-dessus du prévu`}
          </p>
        ) : null}
      </div>

      <div className="field-box">
        <label className="label" htmlFor="ligne-categorie">
          Catégorie
        </label>
        <select
          id="ligne-categorie"
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Revient chaque mois</span>
        <Switch checked={isFixed} onChange={setIsFixed} label="Revient chaque mois" />
      </div>

      {selectedCategory?.kind === "SAVINGS" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Compte dans la projection</span>
          <Switch
            checked={countsInProjection}
            onChange={setCountsInProjection}
            label="Compte dans la projection"
          />
        </div>
      ) : null}

      {mode === "edit" ? (
        confirmingDelete ? (
          <div role="alertdialog" aria-label="Confirmer la suppression" className="card" style={{ background: "var(--surface-2)" }}>
            <p style={{ margin: "0 0 12px" }}>Supprimer cette ligne ?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" block onClick={() => setConfirmingDelete(false)}>
                Garder la ligne
              </Button>
              <Button variant="solid-ink" block onClick={onDelete} disabled={submitting}>
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "var(--over)" }}
            onClick={() => setConfirmingDelete(true)}
          >
            Supprimer la ligne
          </button>
        )
      ) : null}

      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button block onClick={onSubmit} disabled={submitting}>
          {submitting ? "…" : mode === "create" ? "Ajouter" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
