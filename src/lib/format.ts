/**
 * Formatage des montants en FCFA : entiers, séparateur de milliers en
 * espace insécable (U+00A0), unité "FCFA" collée par une espace insécable.
 *
 * `Intl.NumberFormat('fr-FR')` utilise une espace fine (U+202F) comme
 * séparateur de milliers : on la remplace par U+00A0 pour rester fidèle
 * aux maquettes ("880 000 FCFA").
 */
const NARROW_NBSP = " ";
const NBSP = " ";

export function formatMontant(value: number): string {
  const rounded = Math.round(value);
  const digits = new Intl.NumberFormat("fr-FR").format(Math.abs(rounded)).replaceAll(
    NARROW_NBSP,
    NBSP
  );
  return rounded < 0 ? `-${digits}` : digits;
}

/** Montant suivi de l'unité, ex. "880 000 FCFA" ou "-20 000 FCFA". */
export function formatFcfa(value: number): string {
  return `${formatMontant(value)}${NBSP}FCFA`;
}

/** Mois en toutes lettres, ex. "Octobre 2026". */
export function formatMoisEnLettres(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    date
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}
