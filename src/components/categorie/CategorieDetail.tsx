"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { UndoSnackbar } from "@/components/ui/UndoSnackbar";
import { LineForm, type CategoryOption, type LineData } from "@/components/categorie/LineForm";
import { LineRow } from "@/components/categorie/LineRow";
import { CategoryIcon, IconChevronLeft, IconPlus } from "@/components/ui/Icons";
import { useFab } from "@/components/nav/FabContext";
import { categoryClass } from "@/lib/categories";
import { ecartLigne } from "@/lib/calculations";
import { formatMontant } from "@/lib/format";

interface CategorieDetailProps {
  category: { id: string; name: string; kind: string };
  lines: LineData[];
  categories: CategoryOption[];
  totalPlanned: number;
  revenu: number;
  moisLabel: string;
}

type ModalState = "create" | { line: LineData } | null;

export function CategorieDetail({ category, lines, categories, totalPlanned, revenu, moisLabel }: CategorieDetailProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; restore: LineData } | null>(null);
  useFab({ label: "Ajouter une ligne", onClick: () => setModal("create") });

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

  const pct = revenu > 0 ? Math.round((totalPlanned / revenu) * 100) : 0;
  const nFixed = lines.filter((l) => l.isFixed).length;
  const ecartTotal = lines.reduce((sum, l) => {
    const e = ecartLigne({ categoryId: l.categoryId, planned: l.planned, actual: l.actual });
    return sum + (e ?? 0);
  }, 0);
  const cls = categoryClass(category.kind);

  return (
    <div>
      <div className="screen-head">
        <Link className="back" href="/mois">
          <IconChevronLeft />
          {moisLabel}
        </Link>
        <div className="head-actions">
          <Button size="sm" className="hide-mobile" onClick={() => setModal("create")}>
            <IconPlus />
            Ajouter une ligne
          </Button>
        </div>
      </div>

      <div className="cols-main">
        <section className={`card ${cls}`} style={{ padding: "var(--space-4) var(--space-4) var(--space-2)" }}>
          <div className="sec-title" style={{ padding: "var(--space-2) 0 var(--space-1)" }}>
            <h2 className="screen-title" style={{ margin: 0 }}>
              {category.name}
            </h2>
            <span className="caption">
              {lines.length} {lines.length === 1 ? "ligne" : "lignes"} · prévu {formatMontant(totalPlanned)} FCFA
            </span>
          </div>

          {lines.length === 0 ? (
            <p className="muted" style={{ padding: "var(--space-4) 0" }}>
              Ajoute une première ligne à cette catégorie.
            </p>
          ) : (
            lines.map((line) => (
              <LineRow
                key={line.id}
                name={line.name}
                planned={line.planned}
                actual={line.actual}
                isFixed={line.isFixed}
                categoryKind={category.kind}
                onClick={() => setModal({ line })}
              />
            ))
          )}
        </section>

        <aside className={`card stack ${cls}`} style={{ padding: "var(--space-6)" }}>
          <div className="cat-head">
            <div className="row-icon">
              <CategoryIcon kind={category.kind} />
            </div>
            <div className="row-main">
              <div className="row-title">{category.name}</div>
              <div className="row-sub">Catégorie</div>
            </div>
          </div>
          <div className="label" style={{ marginTop: "var(--space-2)" }}>
            Total de la catégorie
          </div>
          <div className="t-xl">{formatMontant(totalPlanned)}&nbsp;FCFA</div>
          <div className="meter cat" role="img" aria-label={`${pct} % du revenu`}>
            <span style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <div className="caption">
            {pct} % du revenu · sur {formatMontant(revenu)}&nbsp;FCFA
          </div>
          <div className="field">
            <span className="muted">Lignes fixes reportées chaque mois</span>
            <span className="num">{nFixed}</span>
          </div>
          {ecartTotal !== 0 ? (
            <div className="field">
              <span className="muted">Écart total avec le prévu</span>
              <span className="num" style={{ color: ecartTotal < 0 ? "var(--over)" : "var(--income)" }}>
                {ecartTotal > 0 ? "+" : ""}
                {formatMontant(ecartTotal)} FCFA
              </span>
            </div>
          ) : null}
        </aside>
      </div>

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
        <UndoSnackbar message={snackbar.message} onUndo={onUndo} onDismiss={() => setSnackbar(null)} />
      ) : null}
    </div>
  );
}
