import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma en singleton : en développement, Next.js recharge les
 * modules à chaud et recréerait sinon une connexion à chaque changement de
 * fichier. On le range sur `globalThis` pour le réutiliser.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
