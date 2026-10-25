import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function RootPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const hasOnboarded = (await db.revenueSource.count({ where: { userId: session.userId } })) > 0;
  redirect(hasOnboarded ? "/mois" : "/premier-lancement");
}
