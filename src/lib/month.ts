import { db } from "@/lib/db";

/** Année/mois courants (1-12), selon l'horloge du serveur. */
export function anneeMoisCourants(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Renvoie le mois courant de l'utilisateur, en le créant vide s'il n'existe
 * pas encore (un seul mois par année/mois, règle du cahier des charges).
 * La duplication explicite d'un mois précédent (F7) n'est pas construite
 * dans ce jalon : un mois qui n'existe pas encore est simplement créé vide,
 * ce qui affiche l'état "Ce mois est encore vide" attendu par le handoff.
 */
/** Nombre de mois civils écoulés entre une date et aujourd'hui (0 si ce mois-ci). */
export function moisEcoulesDepuis(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  return Math.max(0, months);
}

/** Libellés "Nov. 2026" pour les n prochains mois (graphiques/tableaux de projection). */
export function prochainsMoisAbreges(n: number): string[] {
  const { year, month } = anneeMoisCourants();
  const labels: string[] = [];
  for (let i = 1; i <= n; i++) {
    const date = new Date(year, month - 1 + i, 1);
    const label = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(date);
    labels.push(label.charAt(0).toUpperCase() + label.slice(1));
  }
  return labels;
}

export async function getOrCreateMoisCourant(userId: string) {
  const { year, month } = anneeMoisCourants();
  const existing = await db.month.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return existing;
  return db.month.create({ data: { userId, year, month } });
}
