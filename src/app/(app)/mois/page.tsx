import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant, anneeMoisCourants, joursRestantsDansLeMois } from "@/lib/month";
import {
  argentPocheParJour,
  argentPocheParSemaine,
  epargneMensuelle,
  partRevenu,
  projection,
  revenuDuMois,
  totalAffecte,
  totalCategorie,
  totalCategorieDepense,
  totalDepense,
  type CategoryLike,
  type LineLike,
} from "@/lib/calculations";
import { contributionsAccumulees, epargnePourProjet, progression, totalProjet } from "@/lib/calculations";
import { moisEcoulesDepuis } from "@/lib/month";
import { formatMoisEnLettres } from "@/lib/format";
import { MoisDashboard } from "@/components/mois/MoisDashboard";
import { MonthSwitchDropdown, type MonthOption } from "@/components/mois/MonthSwitchDropdown";
import { NetBanner } from "@/components/mois/NetBanner";
import { IconHistorique, IconPlus } from "@/components/ui/Icons";

export default async function MoisPage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string; mois?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { userId } = session;

  const { year: anneeCourante, month: moisCourantNum } = anneeMoisCourants();
  const { annee: anneeParam, mois: moisParam } = await searchParams;
  const anneeDemandee = anneeParam ? parseInt(anneeParam, 10) : anneeCourante;
  const moisDemande = moisParam ? parseInt(moisParam, 10) : moisCourantNum;
  const estMoisCourant = anneeDemandee === anneeCourante && moisDemande === moisCourantNum;

  const [moisCourantRow, categories, revenueSources, savingsAccounts, projects, tousLesMois] = await Promise.all([
    // Toujours résolu (et créé si besoin) : sert à la fois pour le mois en
    // cours lui-même, et de filet de sécurité si le mois demandé en
    // paramètre n'existe pas (ex. lien copié avant suppression du compte).
    getOrCreateMoisCourant(userId),
    db.category.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    db.revenueSource.findMany({ where: { userId } }),
    db.savingsAccount.findMany({ where: { userId } }),
    db.project.findMany({
      where: { userId, archived: false },
      include: { items: true },
      orderBy: { createdAt: "asc" },
      take: 2,
    }),
    db.month.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      select: { id: true, year: true, month: true },
    }),
  ]);

  const mois = estMoisCourant
    ? await db.month.findUnique({
        where: { id: moisCourantRow.id },
        include: { lines: { orderBy: { order: "asc" } } },
      })
    : await db.month.findFirst({
        where: { userId, year: anneeDemandee, month: moisDemande },
        include: { lines: { orderBy: { order: "asc" } } },
      });

  // Mois demandé via l'URL mais inexistant (lien périmé, paramètre modifié
  // à la main) : retombe silencieusement sur le mois en cours plutôt que
  // d'afficher une page cassée.
  if (!mois) redirect("/mois");

  const moisOptions: MonthOption[] = tousLesMois.map((m) => ({
    id: m.id,
    year: m.year,
    month: m.month,
    label: formatMoisEnLettres(m.year, m.month),
    current: m.year === anneeCourante && m.month === moisCourantNum,
  }));

  const lines: LineLike[] = mois.lines.map((l) => ({
    categoryId: l.categoryId,
    planned: l.planned,
    actual: l.actual,
    countsInProjection: l.countsInProjection,
  }));
  const categoriesLike: CategoryLike[] = categories.map((c) => ({ id: c.id, kind: c.kind }));

  // Mois en cours : revenu en direct (reflète immédiatement un ajout de
  // source). Mois passé : revenu figé au moment où ce mois a été créé
  // (`revenueSnapshot`, même convention que l'écran Historique) — modifier
  // ses sources de revenu aujourd'hui ne doit pas réécrire le passé.
  const revenu = estMoisCourant ? revenuDuMois(revenueSources) : (mois.revenueSnapshot ?? revenuDuMois(revenueSources));
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

  // "Jours restants dans le mois" n'a de sens que pour le mois en cours
  // (celui qu'on est en train de vivre) : pour un mois passé, 0 — masque
  // naturellement la carte "Argent de poche" dans MoisDashboard, qui ne
  // s'affiche déjà que si l'un des deux montants est non nul.
  const pocketCategory = categories.find((c) => c.kind === "POCKET");
  const pocketPrevu = totalCategorie(lines, pocketCategory?.id ?? "");
  const pocketDepense = totalCategorieDepense(lines, pocketCategory?.id ?? "");
  const resteParJour = estMoisCourant
    ? argentPocheParJour(pocketPrevu, pocketDepense, joursRestantsDansLeMois(anneeCourante, moisCourantNum))
    : 0;
  const resteParSemaine = estMoisCourant ? argentPocheParSemaine(resteParJour) : 0;

  const firstCategoryHref = `/categorie/${categories[0]?.id ?? ""}`;
  const savingsCategory = categories.find((c) => c.kind === "SAVINGS");
  const epargneCategoryHref = `/categorie/${savingsCategory?.id ?? categories[0]?.id ?? ""}`;
  const moisLabel = formatMoisEnLettres(anneeDemandee, moisDemande);

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <h1 className="sr">Mois — {moisLabel}</h1>
      <div className="screen-head">
        <MonthSwitchDropdown label={moisLabel} options={moisOptions} />
        {mois.lines.length > 0 ? (
          <div className="head-actions">
            <Link className="btn btn-secondary btn-sm" href="/historique">
              <IconHistorique />
              Historique
            </Link>
            {estMoisCourant ? (
              <Link className="btn btn-primary btn-sm hide-mobile" href={firstCategoryHref}>
                <IconPlus />
                Ajouter une ligne
              </Link>
            ) : null}
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
            {estMoisCourant
              ? "Ajoute ta première ligne pour voir ton restant et ta projection d'épargne."
              : "Aucune ligne n'a été enregistrée ce mois-là."}
          </p>
          {estMoisCourant ? (
            <Link className="btn btn-primary" href={firstCategoryHref}>
              Ajouter une première ligne
            </Link>
          ) : (
            <Link className="btn btn-secondary" href="/mois">
              Revenir au mois en cours
            </Link>
          )}
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
          epargneCategoryHref={epargneCategoryHref}
          estMoisCourant={estMoisCourant}
        />
      )}

      {estMoisCourant && projetsApercu.length > 0 ? (
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
