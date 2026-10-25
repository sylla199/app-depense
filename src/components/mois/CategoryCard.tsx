import Link from "next/link";
import { CategoryIcon } from "@/components/ui/Icons";
import { formatMontant } from "@/lib/format";

interface CategoryCardProps {
  id: string;
  name: string;
  kind: string;
  total: number;
  part: number;
  lineCount: number;
}

const KIND_CLASS: Record<string, string> = {
  FIXED: "c-fixed",
  SAVINGS: "c-savings",
  FAMILY: "c-family",
  POCKET: "c-pocket",
  CUSTOM: "c-other",
};

/** Carte de catégorie de la grille "Où va ton revenu" — fidèle à `Mois.dc.html`. */
export function CategoryCard({ id, name, kind, total, part, lineCount }: CategoryCardProps) {
  const cls = KIND_CLASS[kind] ?? "c-other";

  return (
    <Link href={`/categorie/${id}`} className={`card stack ${cls}`} style={{ textDecoration: "none", color: "inherit" }}>
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
        <span style={{ width: `${Math.min(100, part)}%` }} />
      </div>
      <div className="caption">{part} % du revenu</div>
    </Link>
  );
}
