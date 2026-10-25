/**
 * File d'attente des lignes ajoutées hors ligne (F9, Should). Stockée dans
 * `localStorage` (pas besoin d'IndexedDB pour quelques lignes en attente) ;
 * purement client, à n'utiliser que depuis des composants "use client".
 */

export interface QueuedLine {
  tempId: string;
  categoryId: string;
  name: string;
  planned: number;
  actual: number | null;
  isFixed: boolean;
  countsInProjection: boolean;
}

const QUEUE_KEY = "gmd-offline-queue";

export function getQueue(): QueuedLine[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedLine[]) : [];
  } catch {
    return [];
  }
}

function setQueue(queue: QueuedLine[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // stockage indisponible : la ligne reste perdue si l'onglet se ferme,
    // mais l'ajout en cours ne plante pas pour autant.
  }
}

export function addToQueue(line: Omit<QueuedLine, "tempId">): QueuedLine {
  const item: QueuedLine = { ...line, tempId: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}` };
  setQueue([...getQueue(), item]);
  return item;
}

export function removeFromQueue(tempId: string): void {
  setQueue(getQueue().filter((l) => l.tempId !== tempId));
}

export function queueLength(): number {
  return getQueue().length;
}
