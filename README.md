# Gérer mes dépenses

Application web de budget mensuel en FCFA (web + PWA), construite jalon par
jalon à partir du cahier des charges et du handoff développeur de Sylla.

Voir [CLAUDE.md](./CLAUDE.md) pour l'état du projet, la stack technique, les
commandes et les conventions.

## Démarrage rapide

```bash
npm install
npx prisma migrate dev
npm run db:seed      # jeu de données de démonstration (facultatif)
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).
# app-depense
