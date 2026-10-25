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
export async function getOrCreateMoisCourant(userId: string) {
  const { year, month } = anneeMoisCourants();
  const existing = await db.month.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return existing;
  return db.month.create({ data: { userId, year, month } });
}
