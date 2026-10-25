"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { CATEGORY_COLOR_PALETTE } from "@/lib/categories";

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  lineCount: number;
}

/** Gestion des catégories (F3, Must) : renommer, colorer, créer, supprimer. */
export function CategoriesManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, { name: string; color: string }>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLOR_PALETTE[5]);
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
      setError("Ce champ est obligatoire.");
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
    <div>
      <h1 className="t-lg" style={{ marginBottom: 16 }}>
        Catégories
      </h1>

      <div className="card stack" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {categories.map((c) => {
          const draft = editing[c.id];
          return (
            <div key={c.id} className="row">
              <span className="dot" style={{ "--c": `var(--${draft?.color ?? c.color})` } as CSSProperties} />
              {draft ? (
                <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="input"
                    value={draft.name}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, [c.id]: { ...prev[c.id], name: e.target.value } }))
                    }
                    aria-label={`Nom de la catégorie ${c.name}`}
                  />
                  <div style={{ display: "flex", gap: 4 }}>
                    {CATEGORY_COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Couleur ${color}`}
                        aria-pressed={draft.color === color}
                        onClick={() =>
                          setEditing((prev) => ({ ...prev, [c.id]: { ...prev[c.id], color } }))
                        }
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: `var(--${color})`,
                          border: draft.color === color ? "2px solid var(--accent)" : "1px solid var(--line)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                  <Button size="sm" onClick={() => saveEdit(c.id)} disabled={submitting}>
                    Enregistrer
                  </Button>
                </div>
              ) : (
                <>
                  <span className="row-main row-title">{c.name}</span>
                  <span className="caption">{c.lineCount} lignes</span>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>
                    Renommer
                  </Button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--over)" }}
                    onClick={() => setDeleteTarget(c)}
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        {creating ? (
          <div className="card" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="Nom de la catégorie" value={newName} onChange={(e) => setNewName(e.target.value)} error={error} />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {CATEGORY_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Couleur ${color}`}
                  aria-pressed={newColor === color}
                  onClick={() => setNewColor(color)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: `var(--${color})`,
                    border: newColor === color ? "2px solid var(--accent)" : "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <Button onClick={createCategory} disabled={submitting} style={{ marginBottom: 8 }}>
              Créer
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setCreating(true)}>
            Créer une catégorie
          </Button>
        )}
      </div>

      {deleteTarget ? (
        <Modal title="Supprimer la catégorie" onClose={() => setDeleteTarget(null)}>
          {error ? (
            <p role="alert" className="field-error" style={{ marginBottom: 12 }}>
              {error}
            </p>
          ) : null}
          {deleteTarget.lineCount > 0 ? (
            <>
              <p>
                « {deleteTarget.name} » contient {deleteTarget.lineCount} ligne(s). Choisis où les
                réaffecter avant de supprimer.
              </p>
              <div className="field-box" style={{ marginBottom: 16 }}>
                <label className="label" htmlFor="reassign-to">
                  Réaffecter à
                </label>
                <select
                  id="reassign-to"
                  className="input"
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                >
                  <option value="">Choisis une catégorie</option>
                  {categories
                    .filter((c) => c.id !== deleteTarget.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          ) : (
            <p style={{ marginBottom: 16 }}>Supprimer « {deleteTarget.name} » ?</p>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="solid-ink"
              block
              onClick={confirmDelete}
              disabled={submitting || (deleteTarget.lineCount > 0 && !reassignTo)}
            >
              Supprimer et déplacer
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
