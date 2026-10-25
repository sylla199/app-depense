/**
 * Moteur de calcul du budget — fonctions pures, sans effet de bord.
 *
 * Reprend les formules de la section 5 du cahier des charges et de la
 * section "Règles métier et données" du handoff développeur. Objectif :
 * zéro écart entre un total affiché et la somme de ses lignes. Ces fonctions
 * ne touchent jamais la base de données : elles reçoivent des données déjà
 * chargées et renvoient des nombres. Les montants sont des entiers FCFA.
 */

export type CategoryKind = "FIXED" | "SAVINGS" | "FAMILY" | "POCKET" | "CUSTOM";

export interface CategoryLike {
  id: string;
  kind: CategoryKind;
}

export interface LineLike {
  categoryId: string;
  planned: number;
  actual?: number | null;
  countsInProjection?: boolean;
}

export interface RevenueSourceLike {
  amount: number;
}

export interface SavingsAccountLike {
  balance: number;
  includeInProjection: boolean;
}

export interface ProjectItemLike {
  price: number;
  quantity: number;
}

// --- Revenu et synthèse du mois ---------------------------------------

/** Revenu du mois = somme des sources de revenu. */
export function revenuDuMois(sources: RevenueSourceLike[]): number {
  return sources.reduce((sum, s) => sum + s.amount, 0);
}

/** Total d'une catégorie = somme des montants prévus de ses lignes. */
export function totalCategorie(lines: LineLike[], categoryId: string): number {
  return lines
    .filter((l) => l.categoryId === categoryId)
    .reduce((sum, l) => sum + l.planned, 0);
}

/** Total affecté = somme de toutes les lignes, épargne comprise. */
export function totalAffecte(lines: LineLike[]): number {
  return lines.reduce((sum, l) => sum + l.planned, 0);
}

/**
 * Total dépensé = total affecté moins les lignes d'épargne.
 * Nécessite les catégories pour savoir lesquelles sont de type épargne.
 */
export function totalDepense(lines: LineLike[], categories: CategoryLike[]): number {
  const savingsCategoryIds = new Set(
    categories.filter((c) => c.kind === "SAVINGS").map((c) => c.id)
  );
  return lines
    .filter((l) => !savingsCategoryIds.has(l.categoryId))
    .reduce((sum, l) => sum + l.planned, 0);
}

/** Restant = revenu du mois moins total affecté. Peut être négatif (dépassement). */
export function restant(revenu: number, totalAffecteValue: number): number {
  return revenu - totalAffecteValue;
}

/** Part du revenu d'une catégorie, arrondie à l'entier (en %). */
export function partRevenu(totalCategorieValue: number, revenu: number): number {
  if (revenu <= 0) return 0;
  return Math.round((totalCategorieValue / revenu) * 100);
}

/**
 * Écart d'une ligne = montant prévu moins montant dépensé.
 * Positif = sous le prévu (`--income`), négatif = au-dessus du prévu (`--over`).
 * Retourne `null` si aucun montant dépensé n'a été renseigné.
 */
export function ecartLigne(line: LineLike): number | null {
  if (line.actual === null || line.actual === undefined) return null;
  return line.planned - line.actual;
}

// --- Épargne et projection ----------------------------------------------

/** Épargne mensuelle = somme des lignes d'épargne marquées "compte dans la projection". */
export function epargneMensuelle(lines: LineLike[], categories: CategoryLike[]): number {
  const savingsCategoryIds = new Set(
    categories.filter((c) => c.kind === "SAVINGS").map((c) => c.id)
  );
  return lines
    .filter((l) => savingsCategoryIds.has(l.categoryId) && l.countsInProjection)
    .reduce((sum, l) => sum + l.planned, 0);
}

/**
 * Projection à n mois = soldes des comptes inclus + épargne mensuelle × n.
 * Sans solde renseigné (aucun compte, ou aucun inclus), revient à épargne
 * mensuelle × n, comme demandé par le cahier des charges.
 */
export function projection(
  epargneMensuelleValue: number,
  accounts: SavingsAccountLike[],
  n: number
): number {
  const soldesInclus = accounts
    .filter((a) => a.includeInProjection)
    .reduce((sum, a) => sum + a.balance, 0);
  return soldesInclus + epargneMensuelleValue * n;
}

/**
 * Fonds d'urgence, en mois de dépenses couverts = total des soldes
 * d'épargne (tous comptes) ÷ total dépensé du mois. Objectif : 3 mois.
 */
export function fondsUrgence(
  accounts: SavingsAccountLike[],
  totalDepenseValue: number
): number {
  if (totalDepenseValue <= 0) return 0;
  const totalSoldes = accounts.reduce((sum, a) => sum + a.balance, 0);
  return totalSoldes / totalDepenseValue;
}

// --- Argent de poche ------------------------------------------------------

/** Reste d'argent de poche par jour = (prévu - dépensé) ÷ jours restants dans le mois. */
export function argentPocheParJour(
  prevu: number,
  depense: number,
  joursRestants: number
): number {
  if (joursRestants <= 0) return 0;
  return (prevu - depense) / joursRestants;
}

/** Reste d'argent de poche par semaine = reste par jour × 7. */
export function argentPocheParSemaine(resteParJour: number): number {
  return resteParJour * 7;
}

// --- Répartition proposée -------------------------------------------------

/** Montant proposé d'une catégorie = revenu du mois × pourcentage de la catégorie. */
export function montantProposeCategorie(revenu: number, pourcentage: number): number {
  return Math.round(revenu * (pourcentage / 100));
}

// --- Projets d'achat -------------------------------------------------------

/** Total du projet = somme de (prix unitaire × quantité) des éléments. */
export function totalProjet(items: ProjectItemLike[]): number {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

/**
 * Épargné pour le projet = montant déjà mis de côté + contributions à ce
 * jour de la ligne d'épargne liée (calculées par l'appelant, qui connaît le
 * nombre de mois écoulés depuis la création du projet).
 */
export function epargnePourProjet(initialSaved: number, contributionsADate: number): number {
  return initialSaved + contributionsADate;
}

/** Contributions accumulées = contribution mensuelle × mois écoulés. */
export function contributionsAccumulees(contributionMensuelle: number, moisEcoules: number): number {
  return contributionMensuelle * Math.max(0, moisEcoules);
}

/** Reste à financer = total du projet moins épargné, jamais négatif. */
export function resteAFinancer(total: number, epargne: number): number {
  return Math.max(0, total - epargne);
}

/** Progression = épargné ÷ total, plafonnée à 100 %, arrondie à l'entier. */
export function progression(epargne: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((epargne / total) * 100));
}

/**
 * Nombre de mois restants pour atteindre le projet = reste à financer ÷
 * contribution mensuelle, arrondi au mois supérieur.
 * Retourne `null` si la contribution mensuelle est nulle (durée infinie).
 */
export function moisRestantsProjet(reste: number, contributionMensuelle: number): number | null {
  if (contributionMensuelle <= 0) return reste <= 0 ? 0 : null;
  if (reste <= 0) return 0;
  return Math.ceil(reste / contributionMensuelle);
}

/** Contribution nécessaire pour atteindre une date cible, arrondie au supérieur. */
export function contributionPourDate(reste: number, moisJusquaCible: number): number {
  if (moisJusquaCible <= 0) return reste;
  return Math.ceil(reste / moisJusquaCible);
}
