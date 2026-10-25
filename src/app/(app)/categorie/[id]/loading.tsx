import { Skeleton } from "@/components/ui/Skeleton";

export default function CategorieLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton width={160} height={16} className="mb-2" />
      <Skeleton width={240} height={28} className="mb-4" />
      <div className="card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ padding: "12px 0" }}>
            <Skeleton height={44} />
          </div>
        ))}
      </div>
    </div>
  );
}
