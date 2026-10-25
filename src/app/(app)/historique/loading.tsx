import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoriqueLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton width={160} height={28} className="mb-4" />
      <div className="card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ padding: "12px 0" }}>
            <Skeleton height={64} />
          </div>
        ))}
      </div>
    </div>
  );
}
