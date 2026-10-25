"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { IconPlus, IconProjets } from "@/components/ui/Icons";
import { formatFcfa, formatMoisEnLettres } from "@/lib/format";

interface ProjectItem {
  id: string;
  name: string;
  total: number;
  epargne: number;
  reste: number;
  progression: number;
  moisRestants: number | null;
  contributionMensuelle: number;
}

function dateEstimeeLabel(moisRestants: number | null): string | null {
  if (moisRestants === null) return null;
  if (moisRestants === 0) return "Objectif atteint";
  const now = new Date();
  const cible = new Date(now.getFullYear(), now.getMonth() + moisRestants, 1);
  const label = formatMoisEnLettres(cible.getFullYear(), cible.getMonth() + 1);
  return `${label}, dans ${moisRestants} ${moisRestants > 1 ? "mois" : "mois"}`;
}

/** Liste des projets d'achat — fidèle à `Projets.dc.html`. */
export function ProjetsManager({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Donne un nom à ton projet.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetDate: targetDate ? `${targetDate}-01` : null }),
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
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="screen-head">
        <h1 className="screen-title">Projets</h1>
        <div className="head-actions">
          {!creating ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <IconPlus />
              Nouveau projet
            </Button>
          ) : null}
        </div>
      </div>
      <p className="muted" style={{ margin: 0, maxWidth: "60ch" }}>
        Regroupe ce que tu veux acheter pour un but précis. Le total se calcule à partir des
        éléments.
      </p>

      {creating ? (
        <form className="inline-form" onSubmit={(e) => e.preventDefault()} aria-labelledby="np-t" style={{ maxWidth: 520 }}>
          <h2 id="np-t" className="screen-title" style={{ margin: 0, fontSize: 18 }}>
            Nouveau projet
          </h2>
          <Field label="Nom du projet" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Voyage à Dakar" error={error} />
          <div className="field-box">
            <label className="label" htmlFor="np-date">
              Date visée <span className="caption">· facultatif</span>
            </label>
            <input id="np-date" className="input" type="month" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div className="wrap" style={{ justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button size="sm" type="button" onClick={onCreate} disabled={submitting}>
              Créer le projet
            </Button>
          </div>
        </form>
      ) : null}

      {projects.length === 0 && !creating ? (
        <section className="card stack c-project" style={{ alignItems: "flex-start", maxWidth: 520, padding: "var(--space-6)" }}>
          <div className="row-icon">
            <IconProjets />
          </div>
          <h2 className="screen-title" style={{ margin: 0 }}>
            Aucun projet pour l&apos;instant
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            Un projet réunit ce que tu veux acheter pour un but précis : une maison, un voyage, un
            mariage. Tu vois le total et la date à laquelle tu y arrives.
          </p>
          <Button onClick={() => setCreating(true)}>Créer un projet</Button>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <div className="cat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
          {projects.map((p) => {
            const dateLabel = dateEstimeeLabel(p.moisRestants);
            return (
              <Link key={p.id} href={`/projets/${p.id}`} className="card stack c-project" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="cat-head">
                  <div className="row-icon">
                    <IconProjets />
                  </div>
                  <div className="row-main">
                    <div className="row-title">{p.name}</div>
                  </div>
                </div>
                <div className="t-md">{formatFcfa(p.total)}</div>
                <div className="meter cat" role="img" aria-label={`${p.progression} % du projet épargné`}>
                  <span style={{ width: `${p.progression}%` }} />
                </div>
                <div className="caption">
                  {p.progression} % · {formatFcfa(p.epargne)} épargnés, reste {formatFcfa(p.reste)}
                </div>
                {dateLabel ? (
                  <div className="wrap">
                    <span className="tag tag-accent">{dateLabel}</span>
                    {p.contributionMensuelle > 0 ? (
                      <span className="caption">avec {formatFcfa(p.contributionMensuelle)} par mois</span>
                    ) : null}
                  </div>
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            className="card stack"
            onClick={() => setCreating(true)}
            style={{
              border: "2px dashed var(--line)",
              background: "transparent",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              color: "var(--accent)",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            <IconPlus style={{ width: 28, height: 28 }} />
            <span className="link">Nouveau projet</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
