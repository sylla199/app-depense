"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatMontant } from "@/lib/format";

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
  onCancel: () => void;
}

function digitsOnly(raw: string): number {
  const v = raw.replace(/\D/g, "").slice(0, 9);
  return v ? parseInt(v, 10) : 0;
}

/** Ajout/modification d'un élément de projet — fidèle à `Projet.dc.html`. */
export function ItemForm({ mode, projectId, initial, onSaved, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [link, setLink] = useState(initial?.link ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [nameErr, setNameErr] = useState(false);
  const [priceErr, setPriceErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    const bad = { nameErr: !name.trim(), priceErr: price <= 0 };
    if (bad.nameErr || bad.priceErr) {
      setNameErr(bad.nameErr);
      setPriceErr(bad.priceErr);
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name, price, quantity, link: link || null, note: note || null };
      await fetch(mode === "create" ? `/api/projets/${projectId}/elements` : `/api/elements-projet/${initial!.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={(e) => e.preventDefault()} aria-labelledby="ne-t" style={{ margin: "var(--space-2) 0" }}>
      <h2 id="ne-t" className="screen-title" style={{ margin: 0, fontSize: 18 }}>
        {mode === "edit" ? "Modifier l'élément" : "Nouvel élément"}
      </h2>
      <div className="field-box">
        <label className="label" htmlFor="ne-name">
          Nom
        </label>
        <input
          id="ne-name"
          className="input"
          type="text"
          placeholder="Ex. Table"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameErr(false);
          }}
          aria-invalid={nameErr ? "true" : undefined}
        />
        {nameErr ? (
          <div className="field-error" role="alert">
            Donne un nom à cet élément.
          </div>
        ) : null}
      </div>
      <div className="wrap" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
        <div className="field-box" style={{ flex: 1, minWidth: 0 }}>
          <label className="label" htmlFor="ne-price">
            Prix unitaire, en FCFA
          </label>
          <input
            id="ne-price"
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={price ? formatMontant(price) : ""}
            onChange={(e) => {
              setPrice(digitsOnly(e.target.value));
              setPriceErr(false);
            }}
            aria-invalid={priceErr ? "true" : undefined}
          />
          {priceErr ? (
            <div className="field-error" role="alert">
              Entre un prix supérieur à 0.
            </div>
          ) : null}
        </div>
        <div className="field-box" style={{ width: 88 }}>
          <label className="label" htmlFor="ne-qty">
            Quantité
          </label>
          <input
            id="ne-qty"
            className="input"
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(99, digitsOnly(e.target.value))))}
          />
        </div>
      </div>
      <div className="field-box">
        <label className="label" htmlFor="ne-link">
          Lien <span className="caption" style={{ textTransform: "none", letterSpacing: 0 }}>· facultatif</span>
        </label>
        <input id="ne-link" className="input" type="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <div className="field-box">
        <label className="label" htmlFor="ne-note">
          Note <span className="caption" style={{ textTransform: "none", letterSpacing: 0 }}>· facultative</span>
        </label>
        <input id="ne-note" className="input" type="text" placeholder="Ex. couleur gris clair" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="wrap" style={{ justifyContent: "flex-end" }}>
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button size="sm" type="button" onClick={save} disabled={submitting}>
          {mode === "edit" ? "Enregistrer" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
