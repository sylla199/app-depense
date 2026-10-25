import { describe, expect, it, vi } from "vitest";
import { joursRestantsDansLeMois } from "@/lib/date";

describe("joursRestantsDansLeMois (argent de poche)", () => {
  it("compte aujourd'hui inclus", () => {
    vi.setSystemTime(new Date(2026, 9, 20)); // 20 octobre 2026, octobre = 31 jours
    expect(joursRestantsDansLeMois(2026, 10)).toBe(12); // 20 au 31 inclus
    vi.useRealTimers();
  });

  it("ne descend jamais sous 1, même le dernier jour du mois", () => {
    vi.setSystemTime(new Date(2026, 9, 31));
    expect(joursRestantsDansLeMois(2026, 10)).toBe(1);
    vi.useRealTimers();
  });
});
