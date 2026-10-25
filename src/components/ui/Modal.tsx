"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { IconClose } from "@/components/ui/Icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Feuille du bas (mobile) / dialogue centré (bureau+tablette) — classes
 * réelles du canvas (`.scrim`, `.sheet`/`.dialog`, `.sheet-grab`,
 * `.sheet-head`, `.sheet-close`, `.sheet-title`). `.scrim` est en
 * `position:absolute` dans le canvas (pensé relatif à un artboard) :
 * `position:fixed` ici, pour couvrir le vrai viewport.
 * `role="dialog"`, `aria-modal`, piège de focus, fermeture par la croix et
 * Échap, focus rendu à l'élément qui a ouvert la modale (section
 * "Accessibilité" du handoff).
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const content = contentRef.current;
    const first = content?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !content) return;
      const focusable = Array.from(content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <>
      <div
        className="scrim"
        style={{ position: "fixed", zIndex: 30 }}
        onMouseDown={onClose}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 31,
          display: "flex",
          alignItems: isDesktop ? "center" : "flex-end",
          justifyContent: "center",
          padding: isDesktop ? "var(--space-4)" : 0,
          pointerEvents: "none",
        }}
      >
        <div
          ref={contentRef}
          className={isDesktop ? "dialog" : "sheet"}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{
            pointerEvents: "auto",
            width: isDesktop ? 480 : "100%",
            maxWidth: isDesktop ? "calc(100vw - 32px)" : undefined,
            maxHeight: "90vh",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {!isDesktop ? <div className="sheet-grab" aria-hidden="true" /> : null}
          <div className="sheet-head">
            <button type="button" className="sheet-close" aria-label="Fermer" onClick={onClose} style={{ display: "grid", placeItems: "center" }}>
              <IconClose />
            </button>
            <div id={titleId} className="sheet-title">
              {title}
            </div>
          </div>
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
