"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconHistorique } from "@/components/ui/Icons";

export interface MonthOption {
  id: string;
  year: number;
  month: number;
  label: string;
  current: boolean;
}

/**
 * Bouton "Octobre 2026 ▾" du tableau de bord Mois : déroule la liste des
 * mois existants pour sauter directement à l'un d'eux, sans passer par
 * Historique. Les mois passés s'affichent sur /mois en lecture seule (voir
 * `estMoisCourant` dans `mois/page.tsx` et `MoisDashboard`).
 */
export function MonthSwitchDropdown({ label, options }: { label: string; options: MonthOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        type="button"
        className="month-switch"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Changer de mois, ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="m-label">{label}</span>
        <IconChevronDown style={open ? { transform: "rotate(180deg)" } : undefined} />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Choisir un mois"
          className="card stack"
          style={{
            position: "absolute",
            top: "calc(100% + var(--space-2))",
            left: 0,
            zIndex: 20,
            width: 260,
            maxHeight: 360,
            overflowY: "auto",
            padding: "var(--space-2)",
            gap: 0,
            boxShadow: "var(--shadow-sheet)",
          }}
        >
          {options.map((o) => (
            <Link
              key={o.id}
              href={o.current ? "/mois" : `/mois?annee=${o.year}&mois=${o.month}`}
              role="option"
              aria-selected={o.label === label}
              className="settings-row link-row"
              style={{ padding: "var(--space-2) var(--space-3)", minHeight: 44 }}
              onClick={() => setOpen(false)}
            >
              <span className="row-main">
                <span className="row-title">{o.label}</span>
                {o.current ? <span className="row-sub">Mois en cours</span> : null}
              </span>
            </Link>
          ))}
          <Link
            href="/historique"
            className="settings-row link-row"
            style={{ padding: "var(--space-2) var(--space-3)", minHeight: 44, borderTop: "1px solid var(--line)" }}
            onClick={() => setOpen(false)}
          >
            <IconHistorique />
            <span className="row-main">
              <span className="row-title">Voir tout l&apos;historique</span>
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
