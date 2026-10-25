import Link from "next/link";
import type { CSSProperties } from "react";
import { formatFcfa } from "@/lib/format";

interface CategoryCardProps {
  id: string;
  name: string;
  color: string;
  total: number;
  part: number;
  lineCount: number;
}

/** Carte de catégorie de la grille "Où va ton revenu" (écran Mois). */
export function CategoryCard({ id, name, color, total, part, lineCount }: CategoryCardProps) {
  const style = { "--c": `var(--${color})` } as CSSProperties;
  const warn = part > 80 && part <= 100;
  const over = part > 100;

  return (
    <Link href={`/categorie/${id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="cat-head">
        <span className="dot" style={style} />
        <span className="row-title">{name}</span>
      </div>
      <p className="t-md amount" style={{ margin: "0 0 8px" }}>
        {formatFcfa(total)}
      </p>
      <div className={`meter cat ${over ? "over" : warn ? "warn" : ""}`} role="img" aria-label={`${part} % du revenu`} style={style}>
        <span style={{ width: `${Math.min(100, part)}%` }} />
      </div>
      <p className="caption" style={{ margin: "8px 0 0" }}>
        {lineCount} {lineCount === 1 ? "ligne" : "lignes"} · {part} % du revenu
      </p>
    </Link>
  );
}
