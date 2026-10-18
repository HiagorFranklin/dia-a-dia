// Converte uma data para "YYYY-MM-DD" no fuso LOCAL.
// Cuidado: date.toISOString() usa UTC — às 22h no Brasil ele já devolve o dia seguinte!
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

// Quantos dias seguidos o hábito foi cumprido, terminando hoje.
// Se hoje ainda não foi marcado, a sequência de ontem continua valendo
// (o dia não acabou), então começamos a contar a partir de ontem.
export function currentStreak(days: string[], today: Date = new Date()): number {
  const done = new Set(days);
  let cursor = done.has(toDayKey(today)) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(toDayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
