import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";

/** Export RGPD de toutes les données de l'utilisateur, au format JSON. */
export async function GET() {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const [user, revenueSources, categories, months, savingsAccounts, projects] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { email: true, discreetMode: true, reduceMotion: true, createdAt: true },
    }),
    db.revenueSource.findMany({ where: { userId } }),
    db.category.findMany({ where: { userId } }),
    db.month.findMany({ where: { userId }, include: { lines: true } }),
    db.savingsAccount.findMany({ where: { userId } }),
    db.project.findMany({ where: { userId }, include: { items: true } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    user,
    revenueSources,
    categories,
    months,
    savingsAccounts,
    projects,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mes-donnees-gerer-mes-depenses.json"',
    },
  });
}
