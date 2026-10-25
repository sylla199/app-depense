"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { formatFcfa, formatMoisEnLettres } from "@/lib/format";

interface ProjectItem {
  id: string;
  name: string;
  total: number;
  epargne: number;
  reste: number;
  progression: number;
  moisRestants: number | null;
  targetDate: string | null;
}

function dateEstimeeLabel(moisRestants: number | null): string | null {
  if (moisRestants === null) return null;
  if (moisRestants === 0) return "Objectif atteint";
  const now = new Date();
  const cible = new Date(now.getFullYear(), now.getMonth() + moisRestants, 1);
  const label = formatMoisEnLettres(cible.getFullYear(), cible.getMonth() + 1);
  return `${label}, dans ${moisRestants} ${moisRestants > 1 ? "mois" : "mois"}`;
}

export function ProjetsManager({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Ce champ est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      router.push(`/projets/${data.project.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 className="t-lg" style={{ margin: 0 }}>
          Projets d&apos;achat
        </h1>
        <Button onClick={() => setCreating(true)}>Nouveau projet</Button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p>Crée un premier projet pour planifier un gros achat.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {projects.map((p) => {
            const dateLabel = dateEstimeeLabel(p.moisRestants);
            return (
              <Link
                key={p.id}
                href={`/projets/${p.id}`}
                className="card"
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                <div className="cat-head">
                  <span className="dot" style={{ "--c": "var(--cat-project)" } as CSSProperties} />
                  <span className="row-title">{p.name}</span>
                </div>
                <p className="t-md amount" style={{ margin: "0 0 8px" }}>
                  {formatFcfa(p.total)}
                </p>
                <div className="meter cat" style={{ "--c": "var(--cat-project)" } as CSSProperties}>
                  <span style={{ width: `${p.progression}%` }} />
                </div>
                <p className="caption" style={{ margin: "8px 0 0" }}>
                  {p.progression} % · {formatFcfa(p.epargne)} épargnés, reste {formatFcfa(p.reste)}
                </p>
                {dateLabel ? <p className="caption" style={{ margin: "4px 0 0" }}>{dateLabel}</p> : null}
              </Link>
            );
          })}
        </div>
      )}

      {creating ? (
        <Modal title="Nouveau projet" onClose={() => setCreating(false)}>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error ? (
              <p role="alert" className="field-error">
                {error}
              </p>
            ) : null}
            <Field label="Nom du projet" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Équipement nouvelle maison" />
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setCreating(false)}>
                Annuler
              </Button>
              <Button block onClick={onCreate} disabled={submitting}>
                Créer
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
