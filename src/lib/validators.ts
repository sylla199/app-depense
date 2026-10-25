/**
 * Validateurs purs, sans dépendance serveur — contrairement à `lib/auth.ts`
 * (qui importe `next/headers`), ce fichier est sûr à importer depuis un
 * composant client. `lib/auth.ts` et `lib/validation.ts` les réexportent
 * pour le code serveur.
 */

/** 8 caractères minimum, au moins un chiffre (règle du handoff). */
export function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

/** Format `texte@texte.texte` (règle du handoff). */
export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
