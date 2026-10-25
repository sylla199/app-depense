"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { UndoSnackbar } from "@/components/ui/UndoSnackbar";
import { LineForm, type CategoryOption, type LineData } from "@/components/categorie/LineForm";
import { LineRow } from "@/components/categorie/LineRow";
import { formatFcfa } from "@/lib/format";

interface CategorieDetailProps {
  category: { id: string; name: string };
  lines: LineData[];
  categories: CategoryOption[];
  totalPlanned: number;
}

type ModalState = "create" | { line: LineData } | null;

export function CategorieDetail({ category, lines, categories, totalPlanned }: CategorieDetailProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; restore: LineData } | null>(null);

  function refresh() {
    setModal(null);
    router.refresh();
  }

  function onDeleted(line: LineData) {
    setModal(null);
    setSnackbar({ message: `${line.name} supprimée · Annuler`, restore: line });
    router.refresh();
  }

  async function onUndo() {
    if (!snackbar) return;
    const { restore } = snackbar;
    await fetch("/api/lignes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: restore.name,
        planned: restore.planned,
        actual: restore.actual,
        categoryId: restore.categoryId,
        isFixed: restore.isFixed,
        countsInProjection: restore.countsInProjection,
      }),
    });
    setSnackbar(null);
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 className="t-lg" style={{ margin: 0 }}>
            {category.name}
          </h1>
          <p className="caption" style={{ margin: 0 }}>
            {lines.length} {lines.length === 1 ? "ligne" : "lignes"} · prévu {formatFcfa(totalPlanned)}
          </p>
        </div>
        <Button onClick={() => setModal("create")} className="hidden lg:inline-flex">
          Ajouter une ligne
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p>Ajoute une première ligne à cette catégorie.</p>
        </div>
      ) : (
        <div className="card">
          {lines.map((line) => (
            <LineRow
              key={line.id}
              name={line.name}
              planned={line.planned}
              actual={line.actual}
              isFixed={line.isFixed}
              onClick={() => setModal({ line })}
            />
          ))}
        </div>
      )}

      {/* Bouton flottant mobile/tablette (le bouton d'en-tête est masqué en dessous de 1024 px). */}
      <button
        type="button"
        className="btn btn-primary lg:hidden"
        style={{ position: "fixed", right: 16, bottom: 96, zIndex: 20 }}
        onClick={() => setModal("create")}
        aria-label="Ajouter une ligne"
      >
        + Ajouter
      </button>

      {modal ? (
        <Modal
          title={modal === "create" ? "Ajouter une ligne" : "Modifier la ligne"}
          onClose={() => setModal(null)}
        >
          <LineForm
            mode={modal === "create" ? "create" : "edit"}
            initial={modal === "create" ? undefined : modal.line}
            categories={categories}
            defaultCategoryId={category.id}
            onSaved={refresh}
            onDeleted={onDeleted}
            onCancel={() => setModal(null)}
          />
        </Modal>
      ) : null}

      {snackbar ? (
        <UndoSnackbar
          message={snackbar.message}
          onUndo={onUndo}
          onDismiss={() => setSnackbar(null)}
        />
      ) : null}
    </div>
  );
}
