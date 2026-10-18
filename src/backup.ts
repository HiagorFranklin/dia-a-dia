import type { Completions, Habit } from "./types";

// `version` permite mudar o formato no futuro sem quebrar backups antigos.
export type Backup = {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completions;
};

export function createBackup(habits: Habit[], completions: Completions): Backup {
  return { version: 1, exportedAt: new Date().toISOString(), habits, completions };
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function isHabit(value: unknown): value is Habit {
  const h = value as Habit;
  return (
    typeof h === "object" &&
    h !== null &&
    typeof h.id === "string" &&
    typeof h.name === "string" &&
    typeof h.color === "string" &&
    typeof h.createdAt === "string"
  );
}

// Valida tudo ANTES de devolver: um arquivo errado nunca deve substituir dados bons.
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }

  const b = data as Backup;
  if (typeof b !== "object" || b === null || b.version !== 1) {
    throw new Error("Este arquivo não é um backup do Dia a Dia.");
  }
  if (!Array.isArray(b.habits) || !b.habits.every(isHabit)) {
    throw new Error("A lista de hábitos do backup está corrompida.");
  }
  if (typeof b.completions !== "object" || b.completions === null) {
    throw new Error("O histórico do backup está corrompido.");
  }
  for (const days of Object.values(b.completions)) {
    if (!Array.isArray(days) || !days.every((d) => typeof d === "string" && DAY_KEY.test(d))) {
      throw new Error("O histórico do backup tem datas inválidas.");
    }
  }
  return b;
}
