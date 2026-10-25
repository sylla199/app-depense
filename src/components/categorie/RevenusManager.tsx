"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { IconChevronLeft, IconPlus, IconTrash } from "@/components/ui/Icons";
import { revenuDuMois } from "@/lib/calculations";
import { formatFcfa, formatMontant } from "@/lib/format";

interface Source {
  id: string;
  name: string;
  amount: number;
  carryOver: boolean;
}

function digitsOnly(raw: string): number {
  const v = raw.replace(/\D/g, "").slice(0, 9);
  return v ? parseInt(v, 10) : 0;
}

/** Sources de revenu — fidèle à `Revenus.dc.html`. */
export function RevenusManager({ sources }: { sources: Source[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = revenuDuMois(sources);

  async function patchSource(id: string, data: Record<string, unknown>) {
    await fetch(`/api/revenus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  async function onDelete(id: string) {
    await fetch(`/api/revenus/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onAdd() {
    setError(null);
    if (!name.trim()) {
      setError("Ce champ est obligatoire.");
      return;
    }
    if (amount <= 0) {
      setError("Entre un montant supérieur à 0.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/revenus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, carryOver: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.amount ?? data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      setName("");
      setAmount(0);
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="screen-head">
        <Link href="/reglages" className="back">
          <IconChevronLeft />
          Réglages
        </Link>
      </div>
      <div className="screen-head">
        <h1 className="screen-title">Sources de revenu</h1>
        <div className="head-actions">
          {!adding ? (
            <Button size="sm" onClick={() => setAdding(true)}>
              <IconPlus />
              Ajouter une source
            </Button>
          ) : null}
        </div>
      </div>

      <div className="cols-main">
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          {sources.length === 0 ? (
            <section className="card" style={{ padding: "var(--space-6)" }}>
              <p className="caption" style={{ margin: 0 }}>
                Ajoute ta première source de revenu.
              </p>
            </section>
          ) : (
            sources.map((s) => (
              <section key={s.id} className="card stack" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }}>
                <div className="field-box">
                  <label className="label" htmlFor={`src-name-${s.id}`}>
                    Source
                  </label>
                  <input
                    id={`src-name-${s.id}`}
                    className="input"
                    type="text"
                    defaultValue={s.name}
                    onBlur={(e) => e.target.value.trim() && e.target.value !== s.name && patchSource(s.id, { name: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label className="label" htmlFor={`src-amt-${s.id}`}>
                    Montant du mois, en FCFA
                  </label>
                  <input
                    id={`src-amt-${s.id}`}
                    className="input input-amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    defaultValue={s.amount ? formatMontant(s.amount) : ""}
                    onBlur={(e) => patchSource(s.id, { amount: digitsOnly(e.target.value) })}
                  />
                </div>
                <div className="field">
                  <div className="row-main">
                    <div>Reprendre chaque mois</div>
                    <div className="caption">Tu peux modifier le montant à tout moment.</div>
                  </div>
                  <Switch
                    checked={s.carryOver}
                    onChange={(next) => patchSource(s.id, { carryOver: next })}
                    label="Reprendre cette source chaque mois"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: "flex-start", color: "var(--over)" }}
                  onClick={() => onDelete(s.id)}
                >
                  <IconTrash />
                  Retirer cette source
                </button>
              </section>
            ))
          )}

          {adding ? (
            <form className="inline-form" onSubmit={(e) => e.preventDefault()} aria-labelledby="ns-t">
              <h2 id="ns-t" className="screen-title" style={{ margin: 0, fontSize: 18 }}>
                Nouvelle source de revenu
              </h2>
              {error ? (
                <p role="alert" className="field-error">
                  {error}
                </p>
              ) : null}
              <div className="field-box">
                <label className="label" htmlFor="ns-name">
                  Nom
                </label>
                <input
                  id="ns-name"
                  className="input"
                  type="text"
                  placeholder="Ex. Freelance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field-box">
                <label className="label" htmlFor="ns-amt">
                  Montant du mois, en FCFA
                </label>
                <input
                  id="ns-amt"
                  className="input input-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount ? formatMontant(amount) : ""}
                  onChange={(e) => setAmount(digitsOnly(e.target.value))}
                />
              </div>
              <div className="wrap" style={{ justifyContent: "flex-end" }}>
                <Button variant="secondary" size="sm" type="button" onClick={() => setAdding(false)}>
                  Annuler
                </Button>
                <Button size="sm" type="button" onClick={onAdd} disabled={submitting}>
                  Ajouter
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <aside className="card stack" style={{ padding: "var(--space-6)" }}>
          <div className="label">Revenu du mois</div>
          <div className="t-xl" aria-live="polite">
            {formatFcfa(total)}
          </div>
          <div className="caption">
            Somme de tes sources de revenu. C&apos;est cette somme que tu répartis ensuite entre
            tes catégories.
          </div>
          <Link href="/mois" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }}>
            Voir le mois
          </Link>
        </aside>
      </div>
    </div>
  );
}
