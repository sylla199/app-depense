import { Skeleton } from "@/components/ui/Skeleton";

export default function ImporterLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton width={160} height={16} className="mb-2" />
      <Skeleton height={8} className="mb-4" />
      <div className="card card-lg">
        <Skeleton width={200} height={24} className="mb-2" />
        <Skeleton height={120} />
      </div>
    </div>
  );
}
