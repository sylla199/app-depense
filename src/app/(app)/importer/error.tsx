"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function ImporterError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger l'import" onRetry={reset} />;
}
