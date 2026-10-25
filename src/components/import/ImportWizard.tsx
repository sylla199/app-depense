"use client";

import Papa from "papaparse";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
  const [fileName, setFileName] = useState("");
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
      setFileName(file.name);

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
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (done) {
    return (
      <div className="card card-lg" style={{ textAlign: "center" }}>
        <div className="celebrate" role="status" style={{ justifyContent: "center", marginBottom: 16 }}>
          🎉 Import terminé
        </div>
        <p style={{ marginBottom: 16 }}>
          {preview.linesNew} lignes ajoutées{preview.categoriesNew > 0 ? `, ${preview.categoriesNew} nouvelle(s) catégorie(s)` : ""}.
        </p>
        <Button onClick={() => router.push("/mois")}>Voir mon mois</Button>
      </div>
    );
  }

  return (
    <div>
      <p className="caption" style={{ marginBottom: 4 }}>
        Étape {step === "upload" ? 1 : step === "mapping" ? 2 : 3} sur 3
      </p>
      <div className="meter" style={{ marginBottom: 24 }}>
        <span style={{ width: `${step === "upload" ? 33 : step === "mapping" ? 66 : 100}%` }} />
      </div>

      {step === "upload" ? (
        <div className="card card-lg">
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Dépose ton fichier CSV
          </h1>
          <p className="caption" style={{ marginBottom: 16 }}>
            Exporte ton tableur actuel en CSV (pas en Excel), puis dépose-le ici.
          </p>

          {fileError ? (
            <div role="alert" style={{ marginBottom: 16 }}>
              <p className="field-error" style={{ marginBottom: 8 }}>
                <span aria-hidden="true">!</span> Ce fichier n&apos;a pas pu être lu
              </p>
              <ul className="caption" style={{ margin: "0 0 12px", paddingLeft: 20 }}>
                <li>Le fichier doit être au format CSV, pas Excel.</li>
                <li>La première ligne doit contenir les titres des colonnes.</li>
                <li>Au moins une colonne de montants doit être présente.</li>
              </ul>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choisir un autre fichier
                </Button>
                <a href="/exemple-import.csv" download className="btn btn-ghost btn-sm">
                  Voir un exemple de fichier
                </a>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) onFile(file);
              }}
              style={{
                border: "2px dashed var(--line-strong)",
                borderRadius: "var(--radius-lg)",
                padding: 32,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              <p style={{ marginBottom: 12 }}>Glisse ton fichier ici, ou</p>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
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

          <a href="/exemple-import.csv" download className="caption" style={{ color: "var(--accent)" }}>
            Voir un exemple de fichier
          </a>
        </div>
      ) : null}

      {step === "mapping" ? (
        <div className="card card-lg">
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Associe les colonnes
          </h1>
          <p className="caption" style={{ marginBottom: 16 }}>
            {fileName} · {rawRows.length} lignes détectées
          </p>

          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Catégorie", value: colCategorie, set: setColCategorie },
              { label: "Libellé", value: colLibelle, set: setColLibelle },
              { label: "Montant", value: colMontant, set: setColMontant },
            ].map((field) => (
              <div className="field-box" key={field.label}>
                <label className="label" htmlFor={`col-${field.label}`}>
                  {field.label}
                </label>
                <select
                  id={`col-${field.label}`}
                  className="input"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: "var(--surface-2)", marginBottom: 16 }}>
            <p className="label" style={{ marginBottom: 8 }}>
              Aperçu
            </p>
            {rawRows.slice(0, 3).map((row, i) => (
              <p key={i} className="caption" style={{ margin: "4px 0" }}>
                {row[idx.categorie]} · {row[idx.libelle]} · {row[idx.montant]}
              </p>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={reset}>
              Recommencer
            </Button>
            <Button block onClick={() => setStep("review")}>
              Continuer
            </Button>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="card card-lg">
          <h1 className="t-md" style={{ marginTop: 0 }}>
            Vérifie avant de créer
          </h1>

          {submitError ? (
            <p role="alert" className="field-error" style={{ marginBottom: 12 }}>
              {submitError}
            </p>
          ) : null}

          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <p style={{ margin: 0 }}>
              <strong>{preview.categoriesTotal}</strong> catégories
              {preview.categoriesNew > 0 ? ` (${preview.categoriesNew} nouvelle${preview.categoriesNew > 1 ? "s" : ""})` : ""}
            </p>
            <p style={{ margin: 0 }}>
              <strong>{preview.linesTotal}</strong> lignes ({preview.linesNew} ajoutées par l&apos;import)
            </p>
            <p style={{ margin: 0 }}>
              Restant après import :{" "}
              <strong className={preview.restant < 0 ? "field-error" : ""}>{formatFcfa(preview.restant)}</strong>
            </p>
          </div>

          {skippedRows.length > 0 ? (
            <div className="card" style={{ background: "var(--surface-2)", marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px" }}>
                <strong>{skippedRows.length}</strong> {skippedRows.length > 1 ? "lignes ignorées" : "ligne ignorée"}
              </p>
              <p className="caption" style={{ margin: 0 }}>
                Ligne{skippedRows.length > 1 ? "s" : ""} {skippedRows.map((s) => s.rowNumber).join(", ")} : montant
                ou catégorie manquant ou illisible. Tu pourras les ajouter à la main après.
              </p>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setStep("mapping")}>
              Retour
            </Button>
            <Button block onClick={onValidate} disabled={submitting || validRows.length === 0}>
              {submitting ? "…" : "Créer mes lignes"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
