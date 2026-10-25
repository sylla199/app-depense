/**
 * Utilitaires de date purs, sans dépendance à Prisma — contrairement à
 * `lib/month.ts`, ce fichier est sûr à importer depuis un composant client
 * ("use client"). `lib/month.ts` réexporte ces fonctions pour le code
 * serveur qui préfère tout importer d'un seul endroit.
 */

/** Année/mois courants (1-12), selon l'horloge locale. */
export function anneeMoisCourants(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Ajoute `delta` mois civils à une paire année/mois (delta peut être négatif). */
export function ajouterMois(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/** Nombre de mois civils écoulés entre une date et aujourd'hui (0 si ce mois-ci). */
export function moisEcoulesDepuis(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  return Math.max(0, months);
}

/**
 * Jours restants dans le mois donné, aujourd'hui inclus (jamais 0 — sert de
 * diviseur pour l'argent de poche par jour). `year`/`month` doivent être le
 * mois courant : ce calcul n'a pas de sens pour un mois passé ou futur.
 */
export function joursRestantsDansLeMois(year: number, month: number): number {
  const joursDansLeMois = new Date(year, month, 0).getDate();
  const aujourdhui = new Date().getDate();
  return Math.max(1, joursDansLeMois - aujourdhui + 1);
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
