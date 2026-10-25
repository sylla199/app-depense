"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { UndoSnackbar } from "@/components/ui/UndoSnackbar";
import { ItemForm, type ItemData } from "@/components/projets/ItemForm";
import { formatFcfa, formatMoisEnLettres } from "@/lib/format";

interface ProjectData {
  id: string;
  name: string;
  initialSaved: number;
  monthlyContribution: number;
  targetDate: string;
  archived: boolean;
  total: number;
  epargne: number;
  reste: number;
  progression: number;
  moisRestants: number | null;
}

type ModalState = "create-item" | { item: ItemData } | "edit-project" | null;

function dateEstimeeLabel(moisRestants: number | null): string | null {
  if (moisRestants === null) return null;
  if (moisRestants === 0) return "Objectif atteint";
  const now = new Date();
  const cible = new Date(now.getFullYear(), now.getMonth() + moisRestants, 1);
  return `${formatMoisEnLettres(cible.getFullYear(), cible.getMonth() + 1)}, dans ${moisRestants} mois`;
}

export function ProjetDetail({ project, items }: { project: ProjectData; items: ItemData[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; restore: ItemData } | null>(null);

  // Champs d'édition du projet
  const [editName, setEditName] = useState(project.name);
  const [editInitialSaved, setEditInitialSaved] = useState<number | "">(project.initialSaved);
  const [editMonthlyContribution, setEditMonthlyContribution] = useState<number | "">(project.monthlyContribution);
  const [editTargetDate, setEditTargetDate] = useState(project.targetDate);
  const [editError, setEditError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setModal(null);
    router.refresh();
  }

  async function togglePurchased(item: ItemData) {
    await fetch(`/api/elements-projet/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchased: !item.purchased }),
    });
    router.refresh();
  }

  function onItemDeleted(item: ItemData) {
    setModal(null);
    setSnackbar({ message: `${item.name} supprimé · Annuler`, restore: item });
    router.refresh();
  }

  async function onUndoItem() {
    if (!snackbar) return;
    const { restore } = snackbar;
    await fetch(`/api/projets/${project.id}/elements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: restore.name,
        price: restore.price,
        quantity: restore.quantity,
        link: restore.link,
        note: restore.note,
      }),
    });
    setSnackbar(null);
    router.refresh();
  }

  async function onSaveProject() {
    setEditError(null);
    if (!editName.trim()) {
      setEditError("Ce champ est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projets/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          initialSaved: editInitialSaved === "" ? 0 : editInitialSaved,
          monthlyContribution: editMonthlyContribution === "" ? 0 : editMonthlyContribution,
          targetDate: editTargetDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.errors?.name ?? "Une erreur est survenue.");
        return;
      }
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onArchive() {
    setSubmitting(true);
    try {
      await fetch(`/api/projets/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      router.push("/projets");
    } finally {
      setSubmitting(false);
    }
  }

  const totalAchete = items.filter((it) => it.purchased).reduce((s, it) => s + it.price * it.quantity, 0);
  const dateLabel = dateEstimeeLabel(project.moisRestants);

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h1 className="t-lg" style={{ margin: 0 }}>
          {project.name}
        </h1>
        <Button variant="ghost" size="sm" onClick={() => setModal("edit-project")}>
          Modifier
        </Button>
      </div>

      <div className="card card-lg">
        <p className="label" style={{ marginBottom: 4 }}>
          Montant à atteindre
        </p>
        <p className="t-xl amount" style={{ margin: "0 0 12px" }}>
          {formatFcfa(project.total)}
        </p>
        <div className="meter cat" style={{ "--c": "var(--cat-project)" } as CSSProperties}>
          <span style={{ width: `${project.progression}%` }} />
        </div>
        <p className="caption" style={{ margin: "8px 0 0" }}>
          {project.progression} % · {formatFcfa(project.epargne)} épargnés, reste {formatFcfa(project.reste)}
        </p>
        {dateLabel ? <p className="caption" style={{ margin: "4px 0 0" }}>{dateLabel}</p> : null}
        {project.monthlyContribution > 0 ? (
          <p className="caption" style={{ margin: "4px 0 0" }}>
            Contribution mensuelle : {formatFcfa(project.monthlyContribution)}
          </p>
        ) : null}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 className="label" style={{ margin: 0 }}>
            Éléments
          </h2>
          <Button size="sm" onClick={() => setModal("create-item")}>
            Ajouter un élément
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <p className="caption">Ajoute les éléments à acheter pour ce projet.</p>
          </div>
        ) : (
          <>
            <div className="card">
              {items.map((it) => (
                <div key={it.id} className={`row ${it.purchased ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    role="checkbox"
                    aria-checked={it.purchased}
                    aria-label={`${it.name}, ${it.purchased ? "acheté" : "non acheté"}`}
                    checked={it.purchased}
                    onChange={() => togglePurchased(it)}
                    style={{ width: 20, height: 20 }}
                  />
                  <button
                    type="button"
                    className="row-main"
                    style={{ textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
                    onClick={() => setModal({ item: it })}
                  >
                    <p className="row-title" style={{ margin: 0 }}>
                      {it.name} {it.quantity > 1 ? <span className="caption">× {it.quantity}</span> : null}
                    </p>
                    {it.link ? (
                      <a
                        href={it.link}
                        target="_blank"
                        rel="noreferrer"
                        className="row-sub"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "var(--accent)" }}
                      >
                        Voir le lien
                      </a>
                    ) : null}
                  </button>
                  <span className="row-amount">{formatFcfa(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <p className="caption" style={{ marginTop: 8 }}>
              Acheté : {formatFcfa(totalAchete)} · Reste à acheter : {formatFcfa(project.total - totalAchete)}
            </p>
          </>
        )}
      </div>

      <Button variant="quiet" onClick={onArchive} disabled={submitting}>
        Archiver ce projet
      </Button>

      {modal === "create-item" || (typeof modal === "object" && modal !== null && "item" in modal) ? (
        <Modal
          title={modal === "create-item" ? "Ajouter un élément" : "Modifier l'élément"}
          onClose={() => setModal(null)}
        >
          <ItemForm
            mode={modal === "create-item" ? "create" : "edit"}
            projectId={project.id}
            initial={modal === "create-item" ? undefined : (modal as { item: ItemData }).item}
            onSaved={refresh}
            onDeleted={onItemDeleted}
            onCancel={() => setModal(null)}
          />
        </Modal>
      ) : null}

      {modal === "edit-project" ? (
        <Modal title="Modifier le projet" onClose={() => setModal(null)}>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {editError ? (
              <p role="alert" className="field-error">
                {editError}
              </p>
            ) : null}
            <Field label="Nom du projet" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Field
              label="Déjà mis de côté"
              type="number"
              inputMode="numeric"
              amount
              value={editInitialSaved}
              onChange={(e) => setEditInitialSaved(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Field
              label="Contribution mensuelle"
              type="number"
              inputMode="numeric"
              amount
              value={editMonthlyContribution}
              onChange={(e) => setEditMonthlyContribution(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Field
              label="Date cible (facultatif)"
              type="date"
              value={editTargetDate}
              onChange={(e) => setEditTargetDate(e.target.value)}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button block onClick={onSaveProject} disabled={submitting}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {snackbar ? (
        <UndoSnackbar message={snackbar.message} onUndo={onUndoItem} onDismiss={() => setSnackbar(null)} />
      ) : null}
    </div>
  );
}
