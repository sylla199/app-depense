"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconChevronLeft, IconChevronDown } from "@/components/ui/Icons";
import { restant as calcRestant, totalAffecte, type LineLike } from "@/lib/calculations";
import { COLUMN_GUESSES, guessColumn, parseMontant } from "@/lib/csvImport";
import { formatFcfa } from "@/lib/format";

type Step = "upload" | "mapping" | "review";

interface ExistingState {
  revenu: number;
  existingCategoryNames: string[];
  currentLines: LineLike[];
}

interface ValidRow {
  rowNumber: number;
  categoryName: string;
  name: string;
  planned: number;
}
interface SkippedRow {
  rowNumber: number;
}

/**
 * Import du tableur en 3 étapes (F12, Should) : déposer un CSV, associer
 * les colonnes, vérifier ce qui sera créé. "Rien n'est créé avant la
 * validation finale" (règle du handoff).
 */
export function ImportWizard({ existing }: { existing: ExistingState }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [fileError, setFileError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [colCategorie, setColCategorie] = useState("");
  const [colLibelle, setColLibelle] = useState("");
  const [colMontant, setColMontant] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onFile(file: File) {
    setFileError(null);
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setFileError("format");
      return;
    }
    file.text().then((text) => {
      const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
      const rows = result.data;
      if (!rows || rows.length < 2 || rows[0].length < 2) {
        setFileError("structure");
        return;
      }
      const [headerRow, ...dataRows] = rows;
      setHeaders(headerRow);
      setRawRows(dataRows);

      const guessCat = guessColumn(headerRow, COLUMN_GUESSES.categorie);
      const guessLib = guessColumn(headerRow, COLUMN_GUESSES.libelle);
      const guessMont = guessColumn(headerRow, COLUMN_GUESSES.montant);
      if (!guessMont) {
        setFileError("montant");
        return;
      }
      setColCategorie(guessCat ?? headerRow[0]);
      setColLibelle(guessLib ?? headerRow[1] ?? headerRow[0]);
      setColMontant(guessMont);
      setStep("mapping");
    });
  }

  const idx = {
    categorie: headers.indexOf(colCategorie),
    libelle: headers.indexOf(colLibelle),
    montant: headers.indexOf(colMontant),
  };

  const { validRows, skippedRows } = useMemo(() => {
    const valid: ValidRow[] = [];
    const skipped: SkippedRow[] = [];
    rawRows.forEach((row, i) => {
      const rowNumber = i + 2; // +1 pour l'en-tête, +1 pour l'index 0-based
      const categoryName = row[idx.categorie]?.trim();
      const name = row[idx.libelle]?.trim();
      const planned = parseMontant(row[idx.montant] ?? "");
      if (!categoryName || !name || planned === null) {
        skipped.push({ rowNumber });
        return;
      }
      valid.push({ rowNumber, categoryName, name, planned });
    });
    return { validRows: valid, skippedRows: skipped };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawRows, colCategorie, colLibelle, colMontant]);

  const preview = useMemo(() => {
    const newCategoryNames = new Set(
      validRows
        .map((r) => r.categoryName)
        .filter((name) => !existing.existingCategoryNames.some((e) => e.toLowerCase() === name.toLowerCase()))
        .map((n) => n.toLowerCase())
    );
    const totalCategories = new Set([
      ...existing.existingCategoryNames.map((n) => n.toLowerCase()),
      ...validRows.map((r) => r.categoryName.toLowerCase()),
    ]).size;
    const futureLines: LineLike[] = [
      ...existing.currentLines,
      ...validRows.map((r) => ({ categoryId: r.categoryName, planned: r.planned, actual: null })),
    ];
    const futureAffecte = totalAffecte(futureLines);
    const futureRestant = calcRestant(existing.revenu, futureAffecte);
    return {
      categoriesTotal: totalCategories,
      categoriesNew: newCategoryNames.size,
      linesTotal: existing.currentLines.length + validRows.length,
      linesNew: validRows.length,
      restant: futureRestant,
    };
  }, [validRows, existing]);

  async function onValidate() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((r) => ({ categoryName: r.categoryName, name: r.name, planned: r.planned })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.errors?._global ?? "Une erreur est survenue.");
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("upload");
    setFileError(null);
    setHeaders([]);
    setRawRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (done) {
    return (
      <div className="card stack" style={{ padding: "var(--space-6)", textAlign: "center", alignItems: "center" }}>
        <div className="celebrate" role="status">
          🎉 Import terminé
        </div>
        <p style={{ margin: 0 }}>
          {preview.linesNew} lignes ajoutées{preview.categoriesNew > 0 ? `, ${preview.categoriesNew} nouvelle(s) catégorie(s)` : ""}.
        </p>
        <Button onClick={() => router.push("/mois")}>Voir mon mois</Button>
      </div>
    );
  }

  const stepNumber = step === "upload" ? 1 : step === "mapping" ? 2 : 3;

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 760 }}>
      <div className="screen-head">
        <Link href="/reglages" className="back">
          <IconChevronLeft />
          Réglages
        </Link>
        <div className="step-dots" aria-label={`Étape ${stepNumber} sur 3`}>
          <span className={stepNumber >= 1 ? "on" : ""} />
          <span className={stepNumber >= 2 ? "on" : ""} />
          <span className={stepNumber >= 3 ? "on" : ""} />
        </div>
      </div>
      <div className="stack" style={{ gap: "var(--space-2)" }}>
        <h1 className="screen-title" style={{ margin: 0 }}>
          Importer mon tableur
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Dépose ton fichier CSV : on associe les colonnes et les catégories, puis tu valides
          avant que ton mois soit créé.
        </p>
      </div>

      {step === "upload" ? (
        <section className="card stack" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }}>
          {fileError ? (
            <div className="card stack" role="alert" style={{ gap: "var(--space-3)", background: "var(--surface-2)" }}>
              <div className="row-title t-over">Ce fichier n&apos;a pas pu être lu</div>
              <ul className="caption" style={{ margin: 0, paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <li>Le format doit être CSV (pas Excel .xlsx).</li>
                <li>La première ligne doit contenir les titres des colonnes.</li>
                <li>Il faut au moins une colonne de montants.</li>
              </ul>
              <div className="wrap">
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choisir un autre fichier
                </Button>
                <a href="/exemple-import.csv" download className="btn btn-secondary btn-sm">
                  Voir un exemple de fichier
                </a>
              </div>
            </div>
          ) : (
            <div
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) onFile(file);
              }}
            >
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" style={{ width: 32, height: 32, color: "var(--accent)" }}>
                <path d="M12 15V4M7 9l5-5 5 5M5 20h14" />
              </svg>
              <div className="row-title">Dépose ton fichier ici</div>
              <div className="caption">Format CSV. Rien n&apos;est créé avant ta validation.</div>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Choisir un fichier
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </section>
      ) : null}

      {step === "mapping" ? (
        <section className="card stack" style={{ padding: "var(--space-6)", gap: "var(--space-2)" }}>
          <div className="label">Associer les colonnes</div>
          {[
            { label: "Catégorie", value: colCategorie, set: setColCategorie },
            { label: "Libellé", value: colLibelle, set: setColLibelle },
            { label: "Montant", value: colMontant, set: setColMontant },
          ].map((field) => (
            <div className="map-row" key={field.label}>
              <select
                className="csv-cell"
                style={{ border: 0, font: "inherit", width: "100%" }}
                aria-label={`Colonne du fichier pour ${field.label}`}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <IconChevronDown style={{ transform: "rotate(-90deg)" }} />
              <span className="tag tag-accent" style={{ justifySelf: "start" }}>
                {field.label === "Libellé" ? "Nom de la ligne" : field.label}
              </span>
            </div>
          ))}
          <div className="caption" style={{ marginTop: "var(--space-2)" }}>
            Exemple de ligne lue : {rawRows[0]?.[idx.categorie]} · {rawRows[0]?.[idx.libelle]} ·{" "}
            {rawRows[0]?.[idx.montant]}
          </div>
          <div className="wrap" style={{ marginTop: "var(--space-4)" }}>
            <Button variant="secondary" size="sm" onClick={reset}>
              Recommencer
            </Button>
            <Button size="sm" onClick={() => setStep("review")}>
              Continuer
            </Button>
          </div>
        </section>
      ) : null}

      {step === "review" ? (
        <section className="card stack" style={{ padding: "var(--space-6)", gap: "var(--space-4)" }}>
          <div className="label">Ce qui sera créé</div>
          <div className="t-lg">{formatFcfa(existing.revenu)}</div>
          <div className="caption">
            {preview.categoriesTotal} catégories ({preview.categoriesNew} nouvelle
            {preview.categoriesNew !== 1 ? "s" : ""}) · {preview.linesTotal} lignes · le restant du
            mois vaut {formatFcfa(preview.restant)}
          </div>

          {submitError ? (
            <p role="alert" className="field-error">
              {submitError}
            </p>
          ) : null}

          {skippedRows.length > 0 ? (
            <div className="card stack" role="status" style={{ gap: "var(--space-2)", background: "var(--surface-2)" }}>
              <div className="row-title t-warn">
                {skippedRows.length} {skippedRows.length > 1 ? "lignes ignorées" : "ligne ignorée"}
              </div>
              <div className="caption">
                Ligne{skippedRows.length > 1 ? "s" : ""} {skippedRows.map((s) => s.rowNumber).join(", ")} :
                montant ou catégorie manquant ou illisible. Tu pourras les ajouter à la main après.
              </div>
            </div>
          ) : null}

          <div className="wrap">
            <Button onClick={onValidate} disabled={submitting || validRows.length === 0}>
              {submitting ? "…" : "Créer mon mois"}
            </Button>
            <Button variant="ghost" onClick={reset}>
              Recommencer
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
