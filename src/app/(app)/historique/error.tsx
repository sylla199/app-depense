"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function HistoriqueError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger l'historique" onRetry={reset} />;
}
