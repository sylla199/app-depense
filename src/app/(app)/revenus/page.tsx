import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { RevenusManager } from "@/components/categorie/RevenusManager";

export default async function RevenusPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const sources = await db.revenueSource.findMany({ where: { userId: session.userId } });

  return (
    <RevenusManager
      sources={sources.map((s) => ({ id: s.id, name: s.name, amount: s.amount, carryOver: s.carryOver }))}
    />
  );
}
