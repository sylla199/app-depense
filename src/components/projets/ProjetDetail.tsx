"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { UndoSnackbar } from "@/components/ui/UndoSnackbar";
import { IconCheck, IconChevronLeft, IconEdit, IconProjets, IconTrash } from "@/components/ui/Icons";
import { ItemForm, type ItemData } from "@/components/projets/ItemForm";
import { resteAFinancer, totalAchete } from "@/lib/calculations";
import { formatFcfa, formatMontant, formatMoisEnLettres } from "@/lib/format";

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

function digitsOnly(raw: string): number {
  const v = raw.replace(/\D/g, "").slice(0, 9);
  return v ? parseInt(v, 10) : 0;
}

function dateEstimeeLabel(moisRestants: number | null): string | null {
  if (moisRestants === null) return null;
  if (moisRestants === 0) return "Objectif atteint";
  const now = new Date();
  const cible = new Date(now.getFullYear(), now.getMonth() + moisRestants, 1);
  return `${formatMoisEnLettres(cible.getFullYear(), cible.getMonth() + 1)}, dans ${moisRestants} mois`;
}

/** Détail d'un projet d'achat — fidèle à `Projet.dc.html`. */
export function ProjetDetail({ project, items }: { project: ProjectData; items: ItemData[] }) {
  const router = useRouter();
  const [itemModal, setItemModal] = useState<"create" | ItemData | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; restore: ItemData } | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(project.name);

  const [initialSaved, setInitialSaved] = useState(project.initialSaved);
  const [monthlyContribution, setMonthlyContribution] = useState(project.monthlyContribution);
  const [targetDate, setTargetDate] = useState(project.targetDate.slice(0, 7));

  function refresh() {
    setItemModal(null);
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

  async function deleteItem(item: ItemData) {
    await fetch(`/api/elements-projet/${item.id}`, { method: "DELETE" });
    setSnackbar({ message: `${item.name} supprimé`, restore: item });
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

  async function saveName() {
    if (!name.trim()) {
      setName(project.name);
      setEditingName(false);
      return;
    }
    await fetch(`/api/projets/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditingName(false);
    router.refresh();
  }

  async function saveInitialSaved(value: number) {
    setInitialSaved(value);
    await fetch(`/api/projets/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialSaved: value }),
    });
    router.refresh();
  }

  async function saveMonthlyContribution(value: number) {
    setMonthlyContribution(value);
    await fetch(`/api/projets/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyContribution: value }),
    });
    router.refresh();
  }

  async function saveTargetDate(value: string) {
    setTargetDate(value);
    await fetch(`/api/projets/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDate: value ? `${value}-01` : null }),
    });
    router.refresh();
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

  async function onRestaurer() {
    setSubmitting(true);
    try {
      await fetch(`/api/projets/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const totalAcheteValue = totalAchete(items);
  const dateLabel = dateEstimeeLabel(project.moisRestants);
  const finance = project.reste <= 0 && project.total > 0;

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="screen-head">
        <Link href="/projets" className="back">
          <IconChevronLeft />
          Projets
        </Link>
        <div className="head-actions">
          <Button size="sm" onClick={() => setItemModal("create")}>
            Ajouter un élément
          </Button>
        </div>
      </div>

      {project.archived ? (
        <div className="card" role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span>Projet archivé</span>
          <Button variant="secondary" size="sm" onClick={onRestaurer} disabled={submitting}>
            Restaurer
          </Button>
        </div>
      ) : null}

      <div className="cols-main">
        <section className="card stack">
          {editingName ? (
            <div className="wrap" style={{ alignItems: "center" }}>
              <input
                className="input"
                style={{ fontSize: 22, fontWeight: 700, flex: 1 }}
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
              />
              <Button size="sm" onClick={saveName}>
                OK
              </Button>
            </div>
          ) : (
            <div className="wrap" style={{ alignItems: "center", justifyContent: "space-between" }}>
              <h1 className="screen-title" style={{ margin: 0 }}>
                {name}
              </h1>
              <button type="button" className="icon-btn" aria-label="Renommer le projet" onClick={() => setEditingName(true)}>
                <IconEdit />
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="row-icon" style={{ margin: "var(--space-2) 0" }}>
              <IconProjets />
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="row">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={it.purchased}
                  aria-label={`${it.name}, ${it.purchased ? "acheté" : "à acheter"}`}
                  className="check"
                  onClick={() => togglePurchased(it)}
                >
                  <IconCheck className="ico" />
                </button>
                <div className="row-main">
                  <div className="row-title">{it.name}</div>
                  <div className="row-sub">
                    {formatFcfa(it.price)} × {it.quantity}
                    {it.link ? (
                      <>
                        {" · "}
                        <a href={it.link} target="_blank" rel="noreferrer" className="link" onClick={(e) => e.stopPropagation()}>
                          Lien
                        </a>
                      </>
                    ) : null}
                    {it.note ? ` · ${it.note}` : ""}
                  </div>
                </div>
                <div className="row-actions">
                  <span className="row-amount">{formatFcfa(it.price * it.quantity)}</span>
                  <button type="button" className="icon-btn" aria-label={`Modifier ${it.name}`} onClick={() => setItemModal(it)}>
                    <IconEdit />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Supprimer ${it.name}`} onClick={() => deleteItem(it)}>
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))
          )}

          {itemModal ? (
            <ItemForm
              mode={itemModal === "create" ? "create" : "edit"}
              projectId={project.id}
              initial={itemModal === "create" ? undefined : itemModal}
              onSaved={refresh}
              onCancel={() => setItemModal(null)}
            />
          ) : null}

          <div className="stack" style={{ borderTop: "1px solid var(--line)", paddingTop: "var(--space-2)" }}>
            <div className="row-title">Total du projet · {formatFcfa(project.total)}</div>
            <div className="caption">
              Acheté {formatFcfa(totalAcheteValue)} · reste à acheter {formatFcfa(resteAFinancer(project.total, totalAcheteValue))}
            </div>
          </div>
        </section>

        <aside className="card stack c-project">
          <div className="label">{finance ? "Projet financé" : "Reste à financer"}</div>
          <div className="t-xl amount">{formatFcfa(finance ? project.total : project.reste)}</div>
          <div className="meter cat" style={{ "--c": "var(--cat-project)" } as CSSProperties}>
            <span style={{ width: `${project.progression}%` }} />
          </div>
          <div className="caption">
            {project.progression} % · {formatFcfa(project.epargne)} déjà épargnés sur {formatFcfa(project.total)}
          </div>

          {finance ? (
            <div className="celebrate">
              <span className="celebrate-icon">🎉</span>
              <span className="celebrate-title">Projet financé</span>
            </div>
          ) : null}

          <div className="field-box">
            <label className="label" htmlFor="pd-saved">
              Déjà mis de côté, en FCFA
            </label>
            <input
              id="pd-saved"
              className="input"
              type="text"
              inputMode="numeric"
              value={initialSaved ? formatMontant(initialSaved) : ""}
              onChange={(e) => setInitialSaved(digitsOnly(e.target.value))}
              onBlur={(e) => saveInitialSaved(digitsOnly(e.target.value))}
            />
          </div>

          <div className="field-box">
            <label className="label" htmlFor="pd-contrib">
              Versement mensuel vers ce projet
            </label>
            <input
              id="pd-contrib"
              className="input"
              type="text"
              inputMode="numeric"
              value={monthlyContribution ? formatMontant(monthlyContribution) : ""}
              onChange={(e) => setMonthlyContribution(digitsOnly(e.target.value))}
              onBlur={(e) => saveMonthlyContribution(digitsOnly(e.target.value))}
            />
          </div>

          {dateLabel ? (
            <div>
              <span className="label" style={{ display: "block", marginBottom: 4 }}>
                Date estimée d&apos;atteinte
              </span>
              <span className="tag tag-accent">{dateLabel}</span>
            </div>
          ) : null}

          <div className="field-box">
            <label className="label" htmlFor="pd-target">
              Date cible <span className="caption">· facultatif</span>
            </label>
            <input
              id="pd-target"
              className="input"
              type="month"
              value={targetDate}
              onChange={(e) => saveTargetDate(e.target.value)}
            />
          </div>

          {!project.archived ? (
            archiving ? (
              <div className="card" role="alertdialog" aria-label="Confirmer l'archivage" style={{ padding: "var(--space-3)" }}>
                <p className="caption" style={{ margin: "0 0 8px" }}>
                  Archiver ce projet ? Tu pourras le restaurer plus tard.
                </p>
                <div className="wrap" style={{ justifyContent: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={() => setArchiving(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={onArchive} disabled={submitting}>
                    Archiver
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="quiet" onClick={() => setArchiving(true)}>
                Archiver le projet
              </Button>
            )
          ) : null}
        </aside>
      </div>

      {snackbar ? (
        <UndoSnackbar message={snackbar.message} onUndo={onUndoItem} onDismiss={() => setSnackbar(null)} />
      ) : null}
    </div>
  );
}
