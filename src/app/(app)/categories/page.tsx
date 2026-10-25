import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoriesManager } from "@/components/categorie/CategoriesManager";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const categories = await db.category.findMany({
    where: { userId: session.userId },
    orderBy: { order: "asc" },
    include: { _count: { select: { lines: true } } },
  });

  return (
    <CategoriesManager
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        lineCount: c._count.lines,
      }))}
    />
  );
}
