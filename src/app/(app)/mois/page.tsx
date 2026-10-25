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
  revenuDuMois,
  totalAffecte,
  totalCategorie,
  totalDepense,
  type CategoryLike,
  type LineLike,
} from "@/lib/calculations";
import { contributionsAccumulees, epargnePourProjet, progression, totalProjet } from "@/lib/calculations";
import { moisEcoulesDepuis } from "@/lib/month";
import { formatMoisEnLettres } from "@/lib/format";
import { MoisDashboard } from "@/components/mois/MoisDashboard";
import { NetBanner } from "@/components/mois/NetBanner";
import { IconChevronDown, IconHistorique, IconPlus } from "@/components/ui/Icons";

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
  const restant = revenu - affecte;
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

  const firstCategoryHref = `/categorie/${categories[0]?.id ?? ""}`;

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div className="screen-head">
        <Link className="month-switch" href="/historique" aria-label={`Changer de mois, ${formatMoisEnLettres(year, month)}`}>
          <h1 className="m-label" style={{ margin: 0, minWidth: 0 }}>
            {formatMoisEnLettres(year, month)}
          </h1>
          <IconChevronDown />
        </Link>
        {mois.lines.length > 0 ? (
          <div className="head-actions">
            <Link className="btn btn-secondary btn-sm" href="/historique">
              <IconHistorique />
              Historique
            </Link>
            <Link className="btn btn-primary btn-sm hide-mobile" href={firstCategoryHref}>
              <IconPlus />
              Ajouter une ligne
            </Link>
          </div>
        ) : null}
      </div>

      <NetBanner />

      {mois.lines.length === 0 ? (
        <div className="card stack" style={{ alignItems: "center", textAlign: "center", padding: "var(--space-12) var(--space-6)", gap: "var(--space-4)" }}>
          <div className="badge-icon">
            <IconPlus />
          </div>
          <div style={{ font: "600 20px/28px var(--font-sans)" }}>Ce mois est encore vide</div>
          <p className="muted" style={{ margin: 0, maxWidth: "42ch" }}>
            Ajoute ta première ligne pour voir ton restant et ta projection d&apos;épargne.
          </p>
          <Link className="btn btn-primary" href={firstCategoryHref}>
            Ajouter une première ligne
          </Link>
        </div>
      ) : (
        <MoisDashboard
          revenu={revenu}
          affecte={affecte}
          depense={depense}
          restant={restant}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            kind: c.kind,
            total: totalCategorie(lines, c.id),
            part: partRevenu(totalCategorie(lines, c.id), revenu),
            lineCount: mois.lines.filter((l) => l.categoryId === c.id).length,
          }))}
          resteParJour={resteParJour}
          resteParSemaine={resteParSemaine}
          projection3={projection3}
          epargneMensuelle={mensuelle}
          categorieHref={firstCategoryHref}
          ajoutHref={firstCategoryHref}
        />
      )}

      {projetsApercu.length > 0 ? (
        <div className="card">
          <div className="sec-title">
            <p className="label" style={{ margin: 0 }}>
              Projets
            </p>
            <Link href="/projets" className="link">
              Tout voir
            </Link>
          </div>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {projetsApercu.map((p) => (
              <Link key={p.id} href={`/projets/${p.id}`} className="row" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="row-main">
                  <div className="row-title">{p.name}</div>
                  <div className="meter cat c-project" style={{ marginTop: 4 }}>
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
