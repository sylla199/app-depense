"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export interface ItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  link: string | null;
  note: string | null;
  purchased: boolean;
}

interface ItemFormProps {
  mode: "create" | "edit";
  projectId: string;
  initial?: ItemData;
  onSaved: () => void;
  onDeleted?: (item: ItemData) => void;
  onCancel: () => void;
}

/** Ajout/modification d'un élément de projet (section "Projets et détail d'un projet"). */
export function ItemForm({ mode, projectId, initial, onSaved, onDeleted, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState<number | "">(initial?.price ?? "");
  const [quantity, setQuantity] = useState<number | "">(initial?.quantity ?? 1);
  const [link, setLink] = useState(initial?.link ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function onSubmit() {
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: "Ce champ est obligatoire." });
      return;
    }
    if (typeof price !== "number" || price <= 0) {
      setErrors({ price: "Entre un montant supérieur à 0." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        price,
        quantity: quantity === "" ? 1 : quantity,
        link: link || null,
        note: note || null,
      };
      const res = await fetch(
        mode === "create" ? `/api/projets/${projectId}/elements` : `/api/elements-projet/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
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
      const res = await fetch(`/api/elements-projet/${initial.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) onDeleted?.(data.item as ItemData);
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

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 2 }}>
          <Field
            label="Prix unitaire"
            type="number"
            inputMode="numeric"
            amount
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            error={errors.price}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Field
            label="Quantité"
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      </div>

      <Field label="Lien (facultatif)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
      <Field label="Note (facultative)" value={note} onChange={(e) => setNote(e.target.value)} />

      {mode === "edit" ? (
        confirmingDelete ? (
          <div role="alertdialog" aria-label="Confirmer la suppression" className="card" style={{ background: "var(--surface-2)" }}>
            <p style={{ margin: "0 0 12px" }}>Supprimer cet élément ?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" block onClick={() => setConfirmingDelete(false)}>
                Garder
              </Button>
              <Button variant="solid-ink" block onClick={onDelete} disabled={submitting}>
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" style={{ color: "var(--over)" }} onClick={() => setConfirmingDelete(true)}>
            Supprimer l&apos;élément
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
