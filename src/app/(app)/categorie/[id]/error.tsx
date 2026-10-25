"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function CategorieError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard title="Impossible de charger cette catégorie" onRetry={reset} />;
}
