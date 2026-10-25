"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { revenuDuMois } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

interface Source {
  id: string;
  name: string;
  amount: number;
  carryOver: boolean;
}

export function RevenusManager({ sources }: { sources: Source[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [carryOver, setCarryOver] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = revenuDuMois(sources);

  async function onAdd() {
    setError(null);
    if (!name.trim()) {
      setError("Ce champ est obligatoire.");
      return;
    }
    if (typeof amount !== "number" || amount <= 0) {
      setError("Entre un montant supérieur à 0.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/revenus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, carryOver }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.amount ?? data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      setName("");
      setAmount("");
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    await fetch(`/api/revenus/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <h1 className="t-lg" style={{ marginBottom: 4 }}>
        Revenus
      </h1>
      <p className="caption" style={{ marginBottom: 16 }}>
        Revenu du mois : <strong className="amount">{formatFcfa(total)}</strong>
      </p>

      <div className="card">
        {sources.length === 0 ? (
          <p className="caption">Ajoute ta première source de revenu.</p>
        ) : (
          sources.map((s) => (
            <div key={s.id} className="row">
              <div className="row-main">
                <p className="row-title" style={{ margin: 0 }}>
                  {s.name}
                </p>
                <p className="row-sub" style={{ margin: 0 }}>
                  {s.carryOver ? "Reprise chaque mois" : "Ce mois seulement"}
                </p>
              </div>
              <div className="row-end">
                <span className="row-amount">{formatFcfa(s.amount)}</span>
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--over)" }} onClick={() => onDelete(s.id)}>
                  Retirer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        {adding ? (
          <div className="card stack" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {error ? (
              <p role="alert" className="field-error">
                {error}
              </p>
            ) : null}
            <Field label="Nom de la source" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Salaire" />
            <Field
              label="Montant"
              type="number"
              inputMode="numeric"
              amount
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Reprendre chaque mois</span>
              <Switch checked={carryOver} onChange={setCarryOver} label="Reprendre chaque mois" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setAdding(false)}>
                Annuler
              </Button>
              <Button block onClick={onAdd} disabled={submitting}>
                Ajouter
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            Ajouter une source de revenu
          </Button>
        )}
      </div>
    </div>
  );
}
