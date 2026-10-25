"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { IconChevronLeft, IconEdit, IconPlus, IconTrash } from "@/components/ui/Icons";
import { CATEGORY_COLOR_PALETTE } from "@/lib/categories";

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  lineCount: number;
}

const COLOR_NAMES: Record<string, string> = {
  "cat-project": "Rose",
  "cat-fixed": "Bleu-gris",
  "cat-savings": "Jaune",
  "cat-family": "Violet",
  "cat-pocket": "Vert",
  "cat-other": "Gris",
};

/** Gestion des catégories (F3, Must) — fidèle à `Categories.dc.html`. */
export function CategoriesManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, { name: string; color: string }>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLOR_PALETTE[0]);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function startEdit(c: CategoryItem) {
    setEditing((prev) => ({ ...prev, [c.id]: { name: c.name, color: c.color } }));
  }

  async function saveEdit(id: string) {
    const draft = editing[id];
    if (!draft) return;
    setSubmitting(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function createCategory() {
    if (!newName.trim()) {
      setError("Donne un nom à ta catégorie.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, color: newColor }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      setNewName("");
      setCreating(false);
      setError(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteTarget.lineCount > 0 ? { reassignToCategoryId: reassignTo } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Une erreur est survenue.");
        return;
      }
      setDeleteTarget(null);
      setReassignTo("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Link className="back" href="/reglages">
        <IconChevronLeft />
        Réglages
      </Link>
      <div className="screen-head">
        <h1 className="screen-title">Catégories</h1>
        <div className="head-actions">
          {!creating ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <IconPlus />
              Nouvelle catégorie
            </Button>
          ) : null}
        </div>
      </div>
      <p className="muted" style={{ margin: 0, maxWidth: "62ch" }}>
        Quatre catégories sont prêtes pour toi. Renomme-les, change leur couleur, ou crées-en
        d&apos;autres. Les montants restent calculés par l&apos;application.
      </p>

      {creating ? (
        <form
          className="inline-form"
          onSubmit={(e) => e.preventDefault()}
          aria-labelledby="nc-t"
          style={{ maxWidth: 560 }}
        >
          <h2 id="nc-t" className="screen-title" style={{ margin: 0, fontSize: 18 }}>
            Nouvelle catégorie
          </h2>
          <Field label="Nom" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. Santé" error={error} />
          <div className="field-box">
            <span className="label" id="nc-col">
              Couleur
            </span>
            <div className="wrap" role="group" aria-labelledby="nc-col">
              {CATEGORY_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="chip"
                  aria-pressed={newColor === color}
                  onClick={() => setNewColor(color)}
                >
                  <span className={`dot c-${color.replace("cat-", "")}`} />
                  {COLOR_NAMES[color]}
                </button>
              ))}
            </div>
          </div>
          <div className="wrap" style={{ justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button size="sm" type="button" onClick={createCategory} disabled={submitting}>
              Créer la catégorie
            </Button>
          </div>
        </form>
      ) : null}

      <section className="card" style={{ padding: "var(--space-4) var(--space-4) var(--space-2)" }}>
        {categories.map((c) => {
          const draft = editing[c.id];
          const cls = `c-${c.color.replace("cat-", "")}`;
          return (
            <div key={c.id} className="row">
              {draft ? (
                <>
                  <div className="row-icon">
                    <span className={`dot ${cls}`} style={{ width: 14, height: 14 }} />
                  </div>
                  <div className="row-main">
                    <label className="sr" htmlFor={`name-${c.id}`}>
                      Nom de la catégorie
                    </label>
                    <input
                      id={`name-${c.id}`}
                      className="input"
                      type="text"
                      value={draft.name}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [c.id]: { ...prev[c.id], name: e.target.value } }))}
                      style={{ height: 44 }}
                    />
                  </div>
                  <Button size="sm" onClick={() => saveEdit(c.id)} disabled={submitting}>
                    Enregistrer
                  </Button>
                </>
              ) : (
                <>
                  <div className="row-icon">
                    <span className={`dot ${cls}`} style={{ width: 14, height: 14 }} />
                  </div>
                  <div className="row-main">
                    <div className="row-title">{c.name}</div>
                    <div className="row-sub">{c.lineCount} lignes</div>
                  </div>
                  <button type="button" className="icon-btn" aria-label={`Renommer ${c.name}`} onClick={() => startEdit(c)}>
                    <IconEdit />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Supprimer ${c.name}`}
                    onClick={() => setDeleteTarget(c)}
                  >
                    <IconTrash />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </section>
      <div className="caption">Chaque catégorie garde la même couleur partout : tableau de bord, lignes et graphiques.</div>

      {deleteTarget ? (
        <Modal title={`Supprimer « ${deleteTarget.name} » ?`} onClose={() => setDeleteTarget(null)}>
          {error ? (
            <p role="alert" className="field-error" style={{ marginBottom: "var(--space-3)" }}>
              {error}
            </p>
          ) : null}
          {deleteTarget.lineCount > 0 ? (
            <>
              <p className="muted">
                Cette catégorie contient {deleteTarget.lineCount} ligne{deleteTarget.lineCount > 1 ? "s" : ""}. Choisis
                où les déplacer, rien ne sera perdu.
              </p>
              <div className="wrap" role="group" aria-label="Catégorie de destination" style={{ marginBottom: "var(--space-4)" }}>
                {categories
                  .filter((c) => c.id !== deleteTarget.id)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="chip"
                      aria-pressed={reassignTo === c.id}
                      onClick={() => setReassignTo(c.id)}
                    >
                      <span className={`dot c-${c.color.replace("cat-", "")}`} />
                      {c.name}
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
              Elle ne contient aucune ligne.
            </p>
          )}
          <div className="wrap" style={{ justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Garder la catégorie
            </Button>
            <Button
              variant="solid-ink"
              onClick={confirmDelete}
              disabled={submitting || (deleteTarget.lineCount > 0 && !reassignTo)}
            >
              {deleteTarget.lineCount > 0 ? "Supprimer et déplacer" : "Supprimer"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
