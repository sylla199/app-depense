import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { formatMoisEnLettres } from "@/lib/format";

/** Échappe une valeur pour une cellule CSV (virgule, guillemet, retour à la ligne). */
function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Export CSV de l'historique complet (F7, Should). Colonnes définies en
 * réponse au point ouvert #10 du handoff : Mois, Catégorie, Ligne, Prévu,
 * Dépensé. Nom de fichier exact du handoff : historique-depenses.csv.
 */
export async function GET() {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const months = await db.month.findMany({
    where: { userId },
    orderBy: [{ year: "asc" }, { month: "asc" }],
    include: { lines: { include: { category: true }, orderBy: { order: "asc" } } },
  });

  const rows = [["Mois", "Catégorie", "Ligne", "Prévu", "Dépensé"]];
  for (const m of months) {
    const moisLabel = formatMoisEnLettres(m.year, m.month);
    for (const l of m.lines) {
      rows.push([moisLabel, l.category.name, l.name, String(l.planned), l.actual === null ? "" : String(l.actual)]);
    }
  }

  const csv = "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="historique-depenses.csv"',
    },
  });
}
