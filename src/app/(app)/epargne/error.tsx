"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function EpargneError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger ton épargne" onRetry={reset} />;
}
