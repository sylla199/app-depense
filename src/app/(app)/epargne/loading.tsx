import { Skeleton } from "@/components/ui/Skeleton";

export default function EpargneLoading() {
  return (
    <div role="status" aria-busy="true" className="stack" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Skeleton width={120} height={28} />
      <div className="card card-lg">
        <Skeleton width={160} height={16} className="mb-2" />
        <Skeleton width={220} height={40} className="mb-2" />
        <Skeleton height={120} />
      </div>
      <div className="card">
        <Skeleton width={160} height={16} className="mb-2" />
        <Skeleton height={8} />
      </div>
    </div>
  );
}
