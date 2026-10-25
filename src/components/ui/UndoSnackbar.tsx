"use client";

import { useEffect, useRef } from "react";

interface UndoSnackbarProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Bandeau "… supprimée · Annuler" (section "Annuler plutôt que confirmer").
 * Durée recommandée 6 s (point ouvert #6 du handoff), en pause tant que le
 * bandeau a le focus ou le survol.
 */
export function UndoSnackbar({ message, onUndo, onDismiss, durationMs = 6000 }: UndoSnackbarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function arm() {
    timerRef.current = setTimeout(onDismiss, durationMs);
  }
  function disarm() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => {
    arm();
    return disarm;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <div
      className="snackbar"
      role="status"
      style={{ position: "fixed", left: 16, right: 16, bottom: 96, zIndex: 40 }}
      onMouseEnter={disarm}
      onMouseLeave={arm}
      onFocus={disarm}
      onBlur={arm}
    >
      <span>{message}</span>
      <button
        type="button"
        className="snack-btn"
        onClick={() => {
          disarm();
          onUndo();
        }}
      >
        Annuler
      </button>
    </div>
  );
}
