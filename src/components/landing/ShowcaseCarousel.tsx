"use client";

import { useRef, useState, type ReactNode } from "react";
import { IconChevronDown, IconChevronLeft } from "@/components/ui/Icons";

/**
 * Carrousel de fonctions — fidèle à `Landing.dc.html` (section
 * ShowcaseCarousel) : flèches désactivées en bout de course, répond aux
 * flèches du clavier, défilement de 316px par geste (comme la source).
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
    <>
      <div className="carousel-bar">
        <span className="pill-label">
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v9h9" />
            <path d="M20.5 15A9 9 0 1112 3" />
          </svg>
          Dans l&apos;app
        </span>
        <div className="wrap">
          <button type="button" className="icon-btn" aria-label="Précédent" disabled={atStart} onClick={() => scrollBy(-316)}>
            <IconChevronLeft />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Suivant"
            disabled={atEnd}
            onClick={() => scrollBy(316)}
            style={!atEnd ? { background: "var(--accent-soft)", color: "var(--accent)" } : undefined}
          >
            <IconChevronDown style={{ transform: "rotate(-90deg)" }} />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        id="showcase"
        className="carousel"
        role="region"
        aria-label="Aperçus de l'application"
        tabIndex={0}
        onScroll={updateEdges}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollBy(316);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollBy(-316);
          }
        }}
      >
        {children}
      </div>
    </>
  );
}
