/**
 * Jeu de données de démonstration : reproduit l'exemple de référence du
 * tableur actuel (section 5 du cahier des charges / handoff développeur),
 * pour vérifier manuellement que l'app affiche restant = 0, total dépensé
 * = 535 000 et projection à 3 mois = 885 000.
 *
 * Lancer avec : npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/categories";

const db = new PrismaClient();

const EMAIL = "sylla@exemple.com";
const PASSWORD = "Budget2026";

async function main() {
  const existing = await db.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`L'utilisateur de démonstration existe déjà : ${EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const user = await db.user.create({
    data: {
      email: EMAIL,
      passwordHash,
      consentAcceptedAt: new Date(),
      categories: { create: DEFAULT_CATEGORIES },
    },
    include: { categories: true },
  });

  const byKind = Object.fromEntries(user.categories.map((c) => [c.kind, c]));

  await db.revenueSource.create({
    data: { userId: user.id, name: "Revenu du mois", amount: 880000, carryOver: true },
  });

  const now = new Date();
  const month = await db.month.create({
    data: { userId: user.id, year: now.getFullYear(), month: now.getMonth() + 1 },
  });

  const lines: Array<{
    categoryId: string;
    name: string;
    planned: number;
    countsInProjection?: boolean;
  }> = [
    // Achats fixes — 400 000
    { categoryId: byKind.FIXED.id, name: "Internet M'badon", planned: 20000 },
    { categoryId: byKind.FIXED.id, name: "Internet 3 ampoules", planned: 5000 },
    { categoryId: byKind.FIXED.id, name: "Apple Music, iCloud+ et Claude", planned: 16000 },
    { categoryId: byKind.FIXED.id, name: "Maison", planned: 80000 },
    { categoryId: byKind.FIXED.id, name: "Courant", planned: 20000 },
    { categoryId: byKind.FIXED.id, name: "Recharge appel/internet", planned: 8000 },
    { categoryId: byKind.FIXED.id, name: "Autres (Bicents et frais)", planned: 220000 },
    { categoryId: byKind.FIXED.id, name: "Achat maison", planned: 31000 },
    // Épargne — 345 000 (295 000 comptent dans la projection)
    { categoryId: byKind.SAVINGS.id, name: "Djamo", planned: 245000, countsInProjection: true },
    { categoryId: byKind.SAVINGS.id, name: "Banque, compte bloqué", planned: 50000, countsInProjection: false },
    { categoryId: byKind.SAVINGS.id, name: "Banque", planned: 50000, countsInProjection: true },
    // Famille — 35 000
    { categoryId: byKind.FAMILY.id, name: "Kochata", planned: 15000 },
    { categoryId: byKind.FAMILY.id, name: "Karamoko", planned: 10000 },
    { categoryId: byKind.FAMILY.id, name: "Maman", planned: 10000 },
    // Argent de poche — 100 000
    { categoryId: byKind.POCKET.id, name: "Transport Koumassi", planned: 15000 },
    { categoryId: byKind.POCKET.id, name: "Nourriture", planned: 30000 },
    { categoryId: byKind.POCKET.id, name: "Transport Veone", planned: 15000 },
    { categoryId: byKind.POCKET.id, name: "Plaisir", planned: 20000 },
    { categoryId: byKind.POCKET.id, name: "Sport", planned: 20000 },
  ];

  for (const [index, line] of lines.entries()) {
    await db.line.create({
      data: {
        monthId: month.id,
        categoryId: line.categoryId,
        name: line.name,
        planned: line.planned,
        countsInProjection: line.countsInProjection ?? false,
        order: index,
      },
    });
  }

  console.log("Jeu de données créé :");
  console.log(`  E-mail    : ${EMAIL}`);
  console.log(`  Mot de passe : ${PASSWORD}`);
  console.log("  Attendu sur /mois : restant 0, total dépensé 535 000 FCFA.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
