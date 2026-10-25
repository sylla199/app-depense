import { describe, expect, it } from "vitest";
import {
  argentPocheParJour,
  argentPocheParSemaine,
  contributionsAccumulees,
  ecartLigne,
  epargneMensuelle,
  epargnePourProjet,
  fondsUrgence,
  type CategoryLike,
  type LineLike,
  moisRestantsProjet,
  montantProposeCategorie,
  partRevenu,
  progression,
  projection,
  resteAFinancer,
  restant,
  revenuDuMois,
  totalAffecte,
  totalCategorie,
  totalDepense,
  totalProjet,
} from "@/lib/calculations";

/**
 * Exemple de référence du cahier des charges (section 5) / handoff
 * développeur : le tableur actuel de Sylla. Ces chiffres sont la preuve que
 * le moteur de calcul produit "zéro écart" avec la somme des lignes.
 */
const categories: CategoryLike[] = [
  { id: "fixed", kind: "FIXED" },
  { id: "savings", kind: "SAVINGS" },
  { id: "family", kind: "FAMILY" },
  { id: "pocket", kind: "POCKET" },
];

const lines: LineLike[] = [
  // Achats fixes — total 400 000
  { categoryId: "fixed", planned: 20000 }, // Internet M'badon
  { categoryId: "fixed", planned: 5000 }, // Internet 3 ampoules
  { categoryId: "fixed", planned: 16000 }, // Apple Music, iCloud+, Claude
  { categoryId: "fixed", planned: 80000 }, // Maison
  { categoryId: "fixed", planned: 20000 }, // Courant
  { categoryId: "fixed", planned: 8000 }, // Recharge appel/internet
  { categoryId: "fixed", planned: 220000 }, // Autres (Bicents et frais)
  { categoryId: "fixed", planned: 31000 }, // Achat maison
  // Épargne — total 345 000 (245 000 + 50 000 comptent dans la projection,
  // le compte bloqué à 50 000 en est exclu par défaut)
  { categoryId: "savings", planned: 245000, countsInProjection: true }, // Djamo
  { categoryId: "savings", planned: 50000, countsInProjection: false }, // Banque, compte bloqué
  { categoryId: "savings", planned: 50000, countsInProjection: true }, // Banque
  // Famille — total 35 000
  { categoryId: "family", planned: 15000 }, // Kochata
  { categoryId: "family", planned: 10000 }, // Karamoko
  { categoryId: "family", planned: 10000 }, // Maman
  // Argent de poche — total 100 000
  { categoryId: "pocket", planned: 15000 }, // Transport Koumassi
  { categoryId: "pocket", planned: 30000 }, // Nourriture
  { categoryId: "pocket", planned: 15000 }, // Transport Veone
  { categoryId: "pocket", planned: 20000 }, // Plaisir
  { categoryId: "pocket", planned: 20000 }, // Sport
];

describe("exemple de référence du tableur (section 5 du cahier des charges)", () => {
  it("revenu du mois = 880 000 (déduit de restant = 0)", () => {
    expect(totalAffecte(lines)).toBe(880000);
  });

  it("total par catégorie", () => {
    expect(totalCategorie(lines, "fixed")).toBe(400000);
    expect(totalCategorie(lines, "savings")).toBe(345000);
    expect(totalCategorie(lines, "family")).toBe(35000);
    expect(totalCategorie(lines, "pocket")).toBe(100000);
  });

  it("total affecté = 880 000 (toutes les lignes, épargne comprise)", () => {
    expect(totalAffecte(lines)).toBe(880000);
  });

  it("total dépensé = 535 000 (total affecté moins les lignes d'épargne)", () => {
    expect(totalDepense(lines, categories)).toBe(535000);
  });

  it("restant = 0", () => {
    const revenu = revenuDuMois([{ amount: 880000 }]);
    expect(revenu).toBe(880000);
    expect(restant(revenu, totalAffecte(lines))).toBe(0);
  });

  it("épargne mensuelle = 295 000 (le compte bloqué est exclu)", () => {
    expect(epargneMensuelle(lines, categories)).toBe(295000);
  });

  it("projection à 3 mois = 885 000 (sans solde renseigné)", () => {
    const mensuelle = epargneMensuelle(lines, categories);
    expect(projection(mensuelle, [], 3)).toBe(885000);
  });

  it("parts du revenu cohérentes avec le handoff (45 % achats fixes, 39 % épargne)", () => {
    expect(partRevenu(totalCategorie(lines, "fixed"), 880000)).toBe(45);
    expect(partRevenu(totalCategorie(lines, "savings"), 880000)).toBe(39);
  });

  it("écart d'une ligne : positif = sous le prévu, null si rien saisi", () => {
    expect(ecartLigne({ categoryId: "fixed", planned: 20000, actual: 18000 })).toBe(2000);
    expect(ecartLigne({ categoryId: "fixed", planned: 20000, actual: 22000 })).toBe(-2000);
    expect(ecartLigne({ categoryId: "fixed", planned: 20000 })).toBeNull();
  });

  it("fonds d'urgence illustratif : 1 605 000 ÷ 535 000 = 3 mois", () => {
    const comptes = [
      { balance: 805000, includeInProjection: true },
      { balance: 800000, includeInProjection: false }, // comptabilisé quand même (tous comptes)
    ];
    expect(fondsUrgence(comptes, 535000)).toBe(3);
  });

  it("montant proposé d'une catégorie : 50 % de 880 000 = 440 000", () => {
    expect(montantProposeCategorie(880000, 50)).toBe(440000);
  });

  it("argent de poche par jour puis par semaine (3 300 puis 23 100)", () => {
    const parJour = argentPocheParJour(100000, 34000, 20);
    expect(parJour).toBe(3300);
    expect(argentPocheParSemaine(parJour)).toBe(23100);
  });
});

describe("projet d'achat fictif (section 5)", () => {
  const items = [
    { price: 350000, quantity: 1 }, // Canapé
    { price: 200000, quantity: 1 }, // Lit
    { price: 300000, quantity: 1 }, // Réfrigérateur
    { price: 25000, quantity: 4 }, // Chaises
  ];

  it("total du projet = 950 000", () => {
    expect(totalProjet(items)).toBe(950000);
  });

  it("épargné pour le projet = 250 000 (déjà mis de côté + contributions à ce jour)", () => {
    expect(epargnePourProjet(250000, 0)).toBe(250000);
    expect(epargnePourProjet(150000, contributionsAccumulees(100000, 1))).toBe(250000);
  });

  it("reste à financer = 700 000", () => {
    expect(resteAFinancer(totalProjet(items), 250000)).toBe(700000);
  });

  it("progression ≈ 26 %", () => {
    expect(progression(250000, totalProjet(items))).toBe(26);
  });

  it("date estimée : 7 mois à 100 000 FCFA par mois", () => {
    const reste = resteAFinancer(totalProjet(items), 250000);
    expect(moisRestantsProjet(reste, 100000)).toBe(7);
  });

  it("progression plafonnée à 100 % même si l'épargne dépasse le total", () => {
    expect(progression(1200000, totalProjet(items))).toBe(100);
  });
});
