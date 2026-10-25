import { db } from "@/lib/db";
import { revenuDuMois } from "@/lib/calculations";
import { anneeMoisCourants, ajouterMois, joursRestantsDansLeMois, moisEcoulesDepuis, prochainsMoisAbreges } from "@/lib/date";

// Fonctions de date pures, réexportées pour le code serveur qui préfère tout
// importer de "@/lib/month" — un composant client doit, lui, importer
// directement "@/lib/date" (celui-ci touche Prisma, via `db` ci-dessous).
export { anneeMoisCourants, ajouterMois, joursRestantsDansLeMois, moisEcoulesDepuis, prochainsMoisAbreges };

async function revenuActuel(userId: string): Promise<number> {
  const sources = await db.revenueSource.findMany({ where: { userId } });
  return revenuDuMois(sources);
}

/**
 * Renvoie le mois courant de l'utilisateur, en le créant vide s'il n'existe
 * pas encore (un seul mois par année/mois, règle du cahier des charges). Un
 * mois nouvellement créé ainsi (plutôt que dupliqué, voir
 * `dupliquerMoisPrecedent`) affiche l'état "Ce mois est encore vide".
 */
export async function getOrCreateMoisCourant(userId: string) {
  const { year, month } = anneeMoisCourants();
  const existing = await db.month.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return existing;
  const revenueSnapshot = await revenuActuel(userId);
  return db.month.create({ data: { userId, year, month, revenueSnapshot } });
}

/**
 * Duplique le mois le plus récent de l'utilisateur vers le mois civil
 * suivant (F7, Must) : les lignes et leurs montants prévus sont copiés, le
 * dépensé réel est remis à zéro — l'utilisateur les ajuste ensuite (règle de
 * gestion du cahier des charges, et réponse au point ouvert #5 du handoff).
 * Si le mois suivant existe déjà, renvoie ce mois sans rien dupliquer.
 */
export async function dupliquerMoisPrecedent(userId: string) {
  const dernier = await db.month.findFirst({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { lines: true },
  });
  if (!dernier) return null;

  const { year, month } = ajouterMois(dernier.year, dernier.month, 1);
  const existant = await db.month.findUnique({ where: { userId_year_month: { userId, year, month } } });
  if (existant) return existant;

  const revenueSnapshot = await revenuActuel(userId);
  return db.month.create({
    data: {
      userId,
      year,
      month,
      revenueSnapshot,
      lines: {
        create: dernier.lines.map((l) => ({
          categoryId: l.categoryId,
          name: l.name,
          planned: l.planned,
          actual: null,
          isFixed: l.isFixed,
          countsInProjection: l.countsInProjection,
          order: l.order,
        })),
      },
    },
  });
}
