"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function MoisError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger ton mois" onRetry={reset} />;
}
