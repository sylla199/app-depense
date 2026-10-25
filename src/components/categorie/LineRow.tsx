import { ecartLigne, type LineLike } from "@/lib/calculations";
import { formatFcfa } from "@/lib/format";

interface LineRowProps {
  name: string;
  planned: number;
  actual: number | null;
  isFixed: boolean;
  onClick: () => void;
}

export function LineRow({ name, planned, actual, isFixed, onClick }: LineRowProps) {
  const line: LineLike = { categoryId: "", planned, actual };
  const ecart = ecartLigne(line);

  return (
    <button type="button" className="row" style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }} onClick={onClick}>
      <div className="row-main">
        <p className="row-title" style={{ margin: 0 }}>
          {name} {isFixed ? <span className="caption">· Fixe</span> : null}
        </p>
        {ecart !== null ? (
          <p className={`row-sub ${ecart >= 0 ? "" : ""}`} style={{ margin: 0, color: ecart >= 0 ? "var(--income)" : "var(--over)" }}>
            {ecart === 0
              ? "Pile sur le prévu"
              : ecart > 0
                ? `${formatFcfa(ecart)} sous le prévu`
                : `${formatFcfa(Math.abs(ecart))} au-dessus du prévu`}
          </p>
        ) : null}
      </div>
      <div className="row-end">
        <span className="row-amount">{formatFcfa(planned)}</span>
      </div>
    </button>
  );
}
