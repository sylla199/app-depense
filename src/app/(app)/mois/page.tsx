import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant, anneeMoisCourants } from "@/lib/month";
import {
  argentPocheParJour,
  argentPocheParSemaine,
  epargneMensuelle,
  partRevenu,
  projection,
  restant as calcRestant,
  revenuDuMois,
  totalAffecte,
  totalCategorie,
  totalDepense,
  type CategoryLike,
  type LineLike,
} from "@/lib/calculations";
import { formatFcfa, formatMoisEnLettres } from "@/lib/format";
import { RestantMessage, SoldeCard } from "@/components/mois/SoldeCard";
import { CategoryCard } from "@/components/mois/CategoryCard";
import { NetBanner } from "@/components/mois/NetBanner";
import { contributionsAccumulees, epargnePourProjet, progression, totalProjet } from "@/lib/calculations";
import { moisEcoulesDepuis } from "@/lib/month";

export default async function MoisPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { userId } = session;

  const moisCourant = await getOrCreateMoisCourant(userId);
  const [mois, categories, revenueSources, savingsAccounts, projects] = await Promise.all([
    db.month.findUnique({
      where: { id: moisCourant.id },
      include: { lines: { orderBy: { order: "asc" } } },
    }),
    db.category.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    db.revenueSource.findMany({ where: { userId } }),
    db.savingsAccount.findMany({ where: { userId } }),
    db.project.findMany({
      where: { userId, archived: false },
      include: { items: true },
      orderBy: { createdAt: "asc" },
      take: 2,
    }),
  ]);

  if (!mois) redirect("/premier-lancement");

  const lines: LineLike[] = mois.lines.map((l) => ({
    categoryId: l.categoryId,
    planned: l.planned,
    actual: l.actual,
    countsInProjection: l.countsInProjection,
  }));
  const categoriesLike: CategoryLike[] = categories.map((c) => ({ id: c.id, kind: c.kind }));

  const revenu = revenuDuMois(revenueSources);
  const affecte = totalAffecte(lines);
  const depense = totalDepense(lines, categoriesLike);
  const restant = calcRestant(revenu, affecte);
  const mensuelle = epargneMensuelle(lines, categoriesLike);
  const projection3 = projection(
    mensuelle,
    savingsAccounts.map((a) => ({ balance: a.balance, includeInProjection: a.includeInProjection })),
    3
  );

  const projetsApercu = projects.map((p) => {
    const total = totalProjet(p.items);
    const epargne = epargnePourProjet(
      p.initialSaved,
      contributionsAccumulees(p.monthlyContribution, moisEcoulesDepuis(p.createdAt))
    );
    return { id: p.id, name: p.name, total, progression: progression(epargne, total) };
  });

  const pocketCategory = categories.find((c) => c.kind === "POCKET");
  const pocketLines = mois.lines.filter((l) => l.categoryId === pocketCategory?.id);
  const pocketPrevu = pocketLines.reduce((s, l) => s + l.planned, 0);
  const pocketDepense = pocketLines.reduce((s, l) => s + (l.actual ?? 0), 0);
  const { year, month } = anneeMoisCourants();
  const joursDansLeMois = new Date(year, month, 0).getDate();
  const aujourdhui = new Date().getDate();
  const joursRestants = Math.max(1, joursDansLeMois - aujourdhui + 1);
  const resteParJour = argentPocheParJour(pocketPrevu, pocketDepense, joursRestants);
  const resteParSemaine = argentPocheParSemaine(resteParJour);

  if (mois.lines.length === 0) {
    return (
      <div>
        <NetBanner />
        <h1 className="t-lg" style={{ marginBottom: 16, marginTop: 16 }}>
          {formatMoisEnLettres(year, month)}
        </h1>
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p className="t-md">Ce mois est encore vide</p>
          <p className="caption" style={{ margin: "8px 0 24px" }}>
            Ajoute ta première ligne pour voir ton restant et ta projection d&apos;épargne.
          </p>
          <Link href={`/categorie/${categories[0]?.id ?? ""}`} className="btn btn-primary">
            Ajouter une première ligne
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <NetBanner />
      <h1 className="t-lg" style={{ margin: 0 }}>
        {formatMoisEnLettres(year, month)}
      </h1>

      <SoldeCard revenu={revenu} affecte={affecte} depense={depense} restant={restant} />
      <RestantMessage restant={restant} />

      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 className="label" style={{ margin: 0 }}>
            Où va ton revenu
          </h2>
          <Link href="/categories" className="caption" style={{ color: "var(--accent)" }}>
            Gérer
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {categories.map((c) => (
            <CategoryCard
              key={c.id}
              id={c.id}
              name={c.name}
              color={c.color}
              total={totalCategorie(lines, c.id)}
              part={partRevenu(totalCategorie(lines, c.id), revenu)}
              lineCount={mois.lines.filter((l) => l.categoryId === c.id).length}
            />
          ))}
        </div>
      </section>

      {pocketCategory ? (
        <div className="card">
          <p className="label" style={{ marginBottom: 8 }}>
            Argent de poche
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <p className="caption" style={{ margin: 0 }}>
                Par jour
              </p>
              <p className="t-md amount" style={{ margin: 0 }}>
                {formatFcfa(resteParJour)}
              </p>
            </div>
            <div>
              <p className="caption" style={{ margin: 0 }}>
                Par semaine
              </p>
              <p className="t-md amount" style={{ margin: 0 }}>
                {formatFcfa(resteParSemaine)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <p className="label" style={{ margin: 0 }}>
            Projection à 3 mois
          </p>
          <Link href="/epargne" className="caption" style={{ color: "var(--accent)" }}>
            Voir la projection
          </Link>
        </div>
        <p className="t-md amount" style={{ margin: "8px 0 0" }}>
          {formatFcfa(projection3)}
        </p>
      </div>

      {projetsApercu.length > 0 ? (
        <div className="card">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <p className="label" style={{ margin: 0 }}>
              Projets
            </p>
            <Link href="/projets" className="caption" style={{ color: "var(--accent)" }}>
              Tout voir
            </Link>
          </div>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {projetsApercu.map((p) => (
              <Link key={p.id} href={`/projets/${p.id}`} className="row" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="row-main">
                  <p className="row-title" style={{ margin: 0 }}>
                    {p.name}
                  </p>
                  <div className="meter cat" style={{ marginTop: 4 }}>
                    <span style={{ width: `${p.progression}%` }} />
                  </div>
                </div>
                <span className="row-amount">{p.progression} %</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
