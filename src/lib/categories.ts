import type { CategoryKind } from "@/lib/calculations";

/**
 * Catégories créées par défaut à l'inscription (F3, Must), avec leur
 * couleur de token et leur pourcentage de répartition type (section
 * "Premier lancement" du handoff : 45 / 30 / 5 / 20).
 */
export const DEFAULT_CATEGORIES: Array<{
  name: string;
  kind: CategoryKind;
  color: string;
  defaultPercent: number;
  order: number;
}> = [
  { name: "Achats fixes", kind: "FIXED", color: "cat-fixed", defaultPercent: 45, order: 0 },
  { name: "Épargne", kind: "SAVINGS", color: "cat-savings", defaultPercent: 30, order: 1 },
  { name: "Famille", kind: "FAMILY", color: "cat-family", defaultPercent: 5, order: 2 },
  { name: "Argent de poche", kind: "POCKET", color: "cat-pocket", defaultPercent: 20, order: 3 },
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
