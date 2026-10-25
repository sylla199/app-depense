"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function ProjetError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger ce projet" onRetry={reset} />;
}
