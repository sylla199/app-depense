import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReglagesManager } from "@/components/parametres/ReglagesManager";

export default async function ReglagesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, reduceMotion: true, discreetMode: true },
  });
  if (!user) redirect("/connexion");

  return <ReglagesManager email={user.email} discreetMode={user.discreetMode} reduceMotion={user.reduceMotion} />;
}
