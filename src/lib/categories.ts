import type { CategoryKind } from "@/lib/calculations";

/**
 * Catégories créées par défaut à l'inscription (F3, Must), avec leur
 * couleur de token et leur pourcentage de répartition type.
 *
 * Adaptation de la règle 50/30/20 (besoins / envies / épargne) à nos 4
 * catégories : Achats fixes = besoins (50 %), Épargne = épargne (20 %), et
 * les 30 % restants partagés à parts égales entre Famille et Argent de
 * poche (15 % chacun) — la règle d'origine n'a pas de poste "Famille"
 * séparé, ce partage est un choix, pas une valeur standard. Remplace
 * l'ancienne répartition 45/30/5/20 du handoff, qui ne correspondait à
 * aucune norme reconnue (voir discussion avec Sylla, 2026-10-26).
 */
export const DEFAULT_CATEGORIES: Array<{
  name: string;
  kind: CategoryKind;
  color: string;
  defaultPercent: number;
  order: number;
}> = [
  { name: "Achats fixes", kind: "FIXED", color: "cat-fixed", defaultPercent: 50, order: 0 },
  { name: "Épargne", kind: "SAVINGS", color: "cat-savings", defaultPercent: 20, order: 1 },
  { name: "Famille", kind: "FAMILY", color: "cat-family", defaultPercent: 15, order: 2 },
  { name: "Argent de poche", kind: "POCKET", color: "cat-pocket", defaultPercent: 15, order: 3 },
];

/** Palette de couleurs disponible pour une catégorie créée par l'utilisateur. */
export const CATEGORY_COLOR_PALETTE = [
  "cat-fixed",
  "cat-savings",
  "cat-family",
  "cat-pocket",
  "cat-project",
  "cat-other",
] as const;

/** Classe `.c-*` (pose `--c`) du design system pour une catégorie, par type. */
const KIND_TO_CLASS: Record<string, string> = {
  FIXED: "c-fixed",
  SAVINGS: "c-savings",
  FAMILY: "c-family",
  POCKET: "c-pocket",
  CUSTOM: "c-other",
};
export function categoryClass(kind: string): string {
  return KIND_TO_CLASS[kind] ?? "c-other";
}
