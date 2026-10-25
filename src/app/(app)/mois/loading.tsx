import { Skeleton } from "@/components/ui/Skeleton";

export default function MoisLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="stack"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <span className="sr-only" style={{ position: "absolute", left: -9999 }}>
        Chargement
      </span>
      <Skeleton width={180} height={28} />
      <div className="card card-lg">
        <Skeleton width={120} height={16} className="mb-2" />
        <Skeleton width={220} height={48} />
        <Skeleton height={8} className="mt-4" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton width={100} height={16} className="mb-2" />
            <Skeleton width={140} height={24} className="mb-2" />
            <Skeleton height={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
