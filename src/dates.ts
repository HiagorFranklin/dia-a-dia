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

// Os dias das últimas `weeks` semanas, do domingo mais antigo até hoje.
// Começar sempre num domingo garante que cada coluna do mapa seja uma semana
// e cada linha um dia da semana (domingo no topo).
export function lastWeeks(weeks: number, today: Date = new Date()): Date[] {
  const start = addDays(today, -(weeks - 1) * 7 - today.getDay());
  const days: Date[] = [];
  for (let d = start; toDayKey(d) <= toDayKey(today); d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
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
