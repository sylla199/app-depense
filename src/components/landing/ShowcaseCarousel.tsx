"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Carrousel de fonctions (section Landing du handoff) : défilement avec
 * accroche, flèches précédente/suivante désactivées en bout de course,
 * répond aussi aux flèches du clavier.
 */
export function ShowcaseCarousel({ children }: { children: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div>
      <div className="showcase-nav">
        <button
          type="button"
          aria-label="Fonction précédente"
          disabled={atStart}
          onClick={() => scrollBy(-300)}
        >
          ←
        </button>
        <button type="button" aria-label="Fonction suivante" disabled={atEnd} onClick={() => scrollBy(300)}>
          →
        </button>
      </div>
      <div
        ref={trackRef}
        className="showcase"
        role="region"
        aria-label="Fonctions de l'application"
        tabIndex={0}
        onScroll={updateEdges}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollBy(300);
          if (e.key === "ArrowLeft") scrollBy(-300);
        }}
      >
        {children}
      </div>
    </div>
  );
}
