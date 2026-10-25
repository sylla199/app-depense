# Gérer mes dépenses

Application web de budget mensuel en FCFA (web + PWA). Référence produit :
le cahier des charges et le handoff développeur (canvas de design v9) fournis
par Sylla — non inclus dans ce dépôt, mais toutes les règles de calcul, les
messages d'erreur et les design tokens qu'ils décrivent sont repris ici tels
quels (voir les commentaires dans `src/lib/calculations.ts`, `src/lib/
validation.ts` et `src/styles/tokens.css`).

## État du projet

**Jalon 1 construit (F1-F5 + F10)** : compte (inscription/connexion),
revenus, catégories (CRUD), lignes de dépense (CRUD), synthèse du mois
(tableau de bord), parcours "premier lancement".

**Pas encore construits** (stubs "Bientôt" dans la navigation, pas de 404) :
- Épargne et projection (F6) — comptes d'épargne, horizon 1-24 mois, fonds
  d'urgence. Le moteur de calcul (`projection`, `fondsUrgence`) existe déjà
  et est testé dans `tests/calculations.test.ts` ; il ne reste qu'à
  construire l'écran et les routes API des comptes d'épargne.
- Projets d'achat (F11) — le moteur de calcul existe déjà aussi
  (`totalProjet`, `progression`, `moisRestantsProjet`, etc.).
- Historique, duplication de mois, export CSV (F7).
- Réglages complets : mode discret, réduire les animations, thème sombre,
  code PIN (F8). Le schéma Prisma a déjà les champs `discreetMode` /
  `reduceMotion` sur `User`.
- PWA : manifeste, service worker, mode hors ligne, guide d'installation (F9).
- Import CSV du tableur (F12).
- Rappels (F13, V2).
- Landing page publique (F14).
- Réinitialisation du mot de passe par e-mail (F1, Must — reporté : nécessite
  un fournisseur d'envoi d'e-mails à brancher, ex. Resend/Postmark).
- Pages légales (texte provisoire à relire par un juriste avant mise en ligne).
- Thème sombre : les tokens existent dans `tokens.css` (`[data-theme="dark"]`)
  mais rien ne les active encore dans l'UI (prévu V2).

Prochain jalon suggéré, dans l'ordre du cahier des charges (section 9) :
Épargne/Projection puis Projets d'achat (phase 4), puis Historique/Export/
Réglages/RGPD/Landing (phase 5).

## Stack technique

- **Next.js 16 (App Router)** + TypeScript, full-stack (Route Handlers =
  l'API REST ; pages = Server Components qui lisent Prisma directement).
- **Prisma** + **SQLite** en dev (`prisma/dev.db`, ignoré par Git). Pour
  passer en PostgreSQL en production : changer `provider` dans
  `prisma/schema.prisma` en `"postgresql"` et pointer `DATABASE_URL` vers la
  base Postgres — le reste du schéma et tout le code applicatif restent
  identiques.
- **bcryptjs** (hash des mots de passe) + **jose** (JWT de session dans un
  cookie `httpOnly`, jamais dans `localStorage`).
- **zod** pour valider chaque entrée d'API.
- **Vitest** pour le moteur de calcul (`tests/calculations.test.ts`).
- Pas de framework CSS de composants : les classes viennent du design system
  du handoff (`src/styles/components.css`), les tokens de
  `src/styles/tokens.css`. Tailwind n'est utilisé que pour quelques utilitaires
  de mise en page responsive (`hidden lg:flex`, etc.) — jamais pour les
  couleurs ou espacements, qui passent toujours par les tokens CSS.

### Note sur les versions

- Prisma est épinglé en 6.19.3 (CLI et client) : la 7/8 change la façon de
  déclarer `datasource.url` (nécessite `prisma.config.ts` + un adapter), ce
  qui aurait ajouté de la complexité pour peu de bénéfice ici.
- `npm audit` signale 3 vulnérabilités "high" (déni de service par
  récursion dans `deepmerge-ts`, dépendance transitive de `@prisma/config`,
  CLI de dev uniquement — jamais exécuté côté serveur en production). Le
  correctif automatique forcerait Prisma 7/8 ; accepté sciemment pour
  l'instant, à revoir à la prochaine mise à jour volontaire de Prisma.
- `cacheComponents` (Cache Components / PPR) de Next.js 16 est désactivé
  dans `next.config.ts` : cette app est entièrement dynamique (session par
  cookie sur presque toutes les pages), ce mode exigerait un `"use cache"`
  ou un `Suspense` sur chaque accès aux données sans apporter de bénéfice de
  performance ici.

## Commandes

```bash
npm install              # installer les dépendances
npm run dev               # serveur de développement (http://localhost:3000)
npm run build              # build de production
npm run start               # lancer le build de production

npm run test                 # tests du moteur de calcul (Vitest)
npm run test:watch            # idem, en mode watch

npx prisma migrate dev        # appliquer une nouvelle migration (créer le schéma)
npm run prisma:studio           # interface graphique sur la base de données
npm run db:seed                  # jeu de données de démo (voir ci-dessous)

npm run lint                      # ESLint
npx tsc --noEmit                   # vérification des types
```

### Jeu de données de démonstration

`npm run db:seed` crée un utilisateur avec l'exemple de référence exact du
cahier des charges (revenu 880 000 FCFA, 19 lignes dans les 4 catégories).
Identifiants affichés par le script. Sur `/mois`, on doit alors voir
restant = 0 FCFA et total dépensé = 535 000 FCFA.

## Structure

```
prisma/schema.prisma       # modèle de données complet (voir "État du projet")
prisma/seed.ts              # jeu de données de démonstration
src/lib/calculations.ts      # moteur de calcul pur — AUCUN accès BDD ici, testé isolément
src/lib/auth.ts                # bcrypt + session JWT en cookie httpOnly
src/lib/validation.ts           # schémas zod + messages d'erreur littéraux du handoff
src/lib/format.ts                 # formatage FCFA (espace insécable)
src/lib/month.ts                   # résolution du "mois courant"
src/lib/categories.ts                # catégories par défaut + palette de couleurs
src/styles/tokens.css                 # design tokens (couleurs, typo, espacements...)
src/styles/components.css              # classes de composants (.btn, .card, .row, .sheet...)
src/app/(app)/                          # routes protégées (nécessitent une session)
src/app/api/                             # mutations (POST/PATCH/DELETE) ; les lectures
                                           # se font directement dans les pages via Prisma
```

## Conventions

- **Montants** : toujours des entiers FCFA. Jamais de décimales. Affichage
  via `formatFcfa()` (`src/lib/format.ts`), jamais un `toLocaleString()`
  à la main — le séparateur de milliers doit être une espace insécable
  (U+00A0), pas l'espace fine que renvoie `Intl.NumberFormat` par défaut.
- **Calculs** : toute formule du cahier des charges / handoff vit dans
  `src/lib/calculations.ts`, en fonction pure testée. Ne jamais recalculer
  un total à la main dans un composant.
- **Design tokens** : ne jamais coder une couleur, un espacement ou un rayon
  en dur — toujours une variable CSS de `tokens.css`.
- **Lectures vs écritures** : une page (Server Component) lit directement
  via `db` (Prisma). Une mutation déclenchée depuis un composant client passe
  par une route de `src/app/api/`, puis appelle `router.refresh()` pour
  recharger les données serveur à jour.
- **Écrans non construits** : un stub `<ComingSoon />` plutôt qu'une 404.
- **Accessibilité** : WCAG 2.2 AA visé. Toute nouvelle page doit suivre les
  rôles ARIA déjà en place (`role="dialog"`, `aria-live="polite"` sur les
  totaux, `aria-invalid`/`aria-describedby` sur les erreurs).
