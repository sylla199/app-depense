import { ecartLigne, type LineLike } from "@/lib/calculations";
import { formatMontant } from "@/lib/format";
import { CategoryIcon, IconRecurring } from "@/components/ui/Icons";

interface LineRowProps {
  name: string;
  planned: number;
  actual: number | null;
  isFixed: boolean;
  categoryKind: string;
  onClick: () => void;
}

/** Ligne de dépense d'une catégorie — fidèle à `Categorie.dc.html`. */
export function LineRow({ name, planned, actual, isFixed, categoryKind, onClick }: LineRowProps) {
  const line: LineLike = { categoryId: "", planned, actual };
  const ecart = ecartLigne(line);
  const montantAffiche = actual ?? planned;

  return (
    <button type="button" className="row link-row" style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }} onClick={onClick}>
      <div className="row-icon">
        <CategoryIcon kind={categoryKind} />
      </div>
      <div className="row-main">
        <div className="row-title">{name}</div>
        <div className="row-sub">
          {isFixed ? (
            <span className="tag">
              <IconRecurring />
              Fixe
            </span>
          ) : null}
          {actual !== null ? `${isFixed ? " " : ""}Prévu ${formatMontant(planned)} FCFA` : null}
        </div>
      </div>
      <div className="row-end">
        <div className="row-amount">-{formatMontant(montantAffiche)} FCFA</div>
        {ecart !== null ? (
          <div className={`row-gap ${ecart < 0 ? "neg" : ""}`}>
            {ecart === 0 ? "Pile sur le prévu" : `${formatMontant(Math.abs(ecart))} ${ecart > 0 ? "sous le prévu" : "au-dessus du prévu"}`}
          </div>
        ) : null}
      </div>
    </button>
  );
}
