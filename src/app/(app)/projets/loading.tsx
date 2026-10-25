import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjetsLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton width={160} height={28} className="mb-4" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton width={120} height={16} className="mb-2" />
            <Skeleton width={160} height={24} className="mb-2" />
            <Skeleton height={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
