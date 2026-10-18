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

// "YYYY-MM-DD" → Date no fuso local (new Date("2026-10-18") seria meia-noite UTC!).
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// A maior sequência de dias seguidos em todo o histórico.
export function longestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort(); // "YYYY-MM-DD" ordena certo como texto
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    const followsPrevious = previous !== null && toDayKey(addDays(parseDayKey(previous), 1)) === day;
    run = followsPrevious ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

// % dos dias do mês atual (até hoje) em que o hábito foi cumprido.
// Se o hábito começou neste mês, conta a partir do início dele: a criação
// ou o primeiro dia marcado, o que vier antes (o mapa permite marcar o passado).
export function monthCompletion(days: string[], createdAt: string, today: Date = new Date()): number {
  const firstOfMonth = toDayKey(new Date(today.getFullYear(), today.getMonth(), 1));
  const firstDone = days.reduce((min, d) => (d < min ? d : min), createdAt);
  const start = firstDone > firstOfMonth ? firstDone : firstOfMonth;
  const end = toDayKey(today);
  if (start > end) return 0;

  const elapsed = Math.round((parseDayKey(end).getTime() - parseDayKey(start).getTime()) / 86_400_000) + 1;
  const done = new Set(days.filter((d) => d >= start && d <= end)).size;
  return Math.round((done / elapsed) * 100);
}
