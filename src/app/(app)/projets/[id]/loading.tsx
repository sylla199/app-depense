import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjetLoading() {
  return (
    <div role="status" aria-busy="true" className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Skeleton width={200} height={28} />
      <div className="card card-lg">
        <Skeleton width={160} height={16} className="mb-2" />
        <Skeleton width={220} height={40} className="mb-2" />
        <Skeleton height={8} />
      </div>
      <div className="card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: "12px 0" }}>
            <Skeleton height={44} />
          </div>
        ))}
      </div>
    </div>
  );
}
