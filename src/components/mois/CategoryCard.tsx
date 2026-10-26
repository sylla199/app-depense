import Link from "next/link";
import { CategoryIcon } from "@/components/ui/Icons";
import { categoryClass } from "@/lib/categories";
import { formatMontant } from "@/lib/format";

interface CategoryCardProps {
  id: string;
  name: string;
  kind: string;
  total: number;
  part: number;
  lineCount: number;
  /** Faux pour un mois passé : la carte n'ouvre pas `/categorie/[id]`, qui
   *  n'affiche aujourd'hui que le mois en cours (verrait les mauvaises
   *  lignes). Lecture seule, pas de lien. */
  clickable?: boolean;
}

/** Carte de catégorie de la grille "Où va ton revenu" — fidèle à `Mois.dc.html`. */
export function CategoryCard({ id, name, kind, total, part, lineCount, clickable = true }: CategoryCardProps) {
  const cls = categoryClass(kind);

  const content = (
    <>
      <div className="cat-head">
        <div className="row-icon">
          <CategoryIcon kind={kind} />
        </div>
        <div className="row-main">
          <div className="row-title">{name}</div>
          <div className="row-sub">
            {lineCount} {lineCount === 1 ? "ligne" : "lignes"}
          </div>
        </div>
      </div>
      <div className="t-md">{formatMontant(total)} FCFA</div>
      <div className="meter cat" role="img" aria-label={`${part} % du revenu`}>
        {/* `minWidth` en pixels plutôt qu'un plancher en %, pour qu'une
            valeur faible (4 %) reste un segment lisible plutôt qu'un point —
            un plancher en % se réduirait avec la carte à largeur fixe. */}
        <span style={{ width: `${Math.min(100, part)}%`, minWidth: part > 0 ? "16px" : 0 }} />
      </div>
      <div className="caption">{part} % du revenu</div>
    </>
  );

  if (!clickable) {
    return <div className={`card stack ${cls}`}>{content}</div>;
  }

  return (
    <Link href={`/categorie/${id}`} className={`card stack link-row ${cls}`} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  );
}
