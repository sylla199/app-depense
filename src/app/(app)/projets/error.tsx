"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function ProjetsError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger tes projets" onRetry={reset} />;
}
