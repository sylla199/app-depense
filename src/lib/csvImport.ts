/** Aide à l'import CSV (F12) — purement client, aucun accès réseau/BDD. */

/**
 * Lit un montant écrit n'importe comment (espaces normales ou insécables,
 * virgule ou point comme séparateur de milliers, suffixe "FCFA"...) et
 * renvoie un entier positif, ou `null` si rien d'exploitable.
 */
export function parseMontant(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Devine quelle colonne du CSV correspond à un champ cible, par nom d'en-tête. */
export function guessColumn(headers: string[], candidates: string[]): string | null {
  const normalized = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""); // enlève les accents
  for (const candidate of candidates) {
    const match = headers.find((h) => normalized(h).includes(candidate));
    if (match) return match;
  }
  return null;
}

export const COLUMN_GUESSES = {
  categorie: ["categorie", "category"],
  libelle: ["libelle", "nom", "description", "titre", "label"],
  montant: ["montant", "prix", "prevu", "amount", "price"],
};
