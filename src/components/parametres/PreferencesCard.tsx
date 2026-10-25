"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Switch } from "@/components/ui/Switch";

export function PreferencesCard({ reduceMotion }: { reduceMotion: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(reduceMotion);
  const [saving, setSaving] = useState(false);

  async function onChange(next: boolean) {
    setValue(next);
    setSaving(true);
    try {
      await fetch("/api/compte", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reduceMotion: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 12 }}>
        Préférences
      </p>
      <p className="caption" style={{ marginBottom: 12 }}>
        Devise : FCFA.
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span>Réduire les animations</span>
        <Switch checked={value} onChange={onChange} label="Réduire les animations" disabled={saving} />
      </div>
      <p className="caption">
        Prioritaire sur le réglage de ton téléphone. Mode discret, thème sombre et code PIN
        arrivent dans un prochain jalon.
      </p>
    </div>
  );
}
