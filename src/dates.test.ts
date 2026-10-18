import { describe, expect, it } from "vitest";
import { currentStreak, lastWeeks, longestStreak, monthCompletion, toDayKey } from "./dates";

const today = new Date(2026, 9, 18); // 18/out/2026 (mês começa em 0)

describe("toDayKey", () => {
  it("usa o fuso local, não UTC", () => {
    expect(toDayKey(new Date(2026, 9, 18, 23, 30))).toBe("2026-10-18");
  });
});

describe("currentStreak", () => {
  it("é zero sem nenhum dia marcado", () => {
    expect(currentStreak([], today)).toBe(0);
  });

  it("conta dias seguidos terminando hoje", () => {
    expect(currentStreak(["2026-10-16", "2026-10-17", "2026-10-18"], today)).toBe(3);
  });

  it("mantém a sequência de ontem se hoje ainda não foi marcado", () => {
    expect(currentStreak(["2026-10-16", "2026-10-17"], today)).toBe(2);
  });

  it("para no primeiro buraco", () => {
    expect(currentStreak(["2026-10-14", "2026-10-17", "2026-10-18"], today)).toBe(2);
  });

  it("atravessa a virada do mês", () => {
    const nov1 = new Date(2026, 10, 1);
    expect(currentStreak(["2026-10-30", "2026-10-31", "2026-11-01"], nov1)).toBe(3);
  });
});

describe("lastWeeks", () => {
  // 18/out/2026 é um domingo; 21/out é uma quarta.
  it("começa num domingo e termina hoje", () => {
    const wednesday = new Date(2026, 9, 21);
    const days = lastWeeks(13, wednesday);
    expect(days[0].getDay()).toBe(0);
    expect(toDayKey(days[days.length - 1])).toBe("2026-10-21");
  });

  it("tem semanas completas mais os dias da semana atual", () => {
    // 12 semanas cheias + domingo a quarta (4 dias)
    expect(lastWeeks(13, new Date(2026, 9, 21))).toHaveLength(12 * 7 + 4);
  });

  it("quando hoje é domingo, a última coluna tem um só dia", () => {
    expect(lastWeeks(13, today)).toHaveLength(12 * 7 + 1);
  });
});

describe("longestStreak", () => {
  it("é zero sem histórico", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("encontra a maior sequência mesmo fora de ordem", () => {
    const days = ["2026-10-10", "2026-10-02", "2026-10-01", "2026-10-03", "2026-10-11"];
    expect(longestStreak(days)).toBe(3);
  });

  it("ignora dias duplicados", () => {
    expect(longestStreak(["2026-10-01", "2026-10-01", "2026-10-02"])).toBe(2);
  });

  it("atravessa a virada do ano", () => {
    expect(longestStreak(["2026-12-30", "2026-12-31", "2027-01-01"])).toBe(3);
  });
});

describe("monthCompletion", () => {
  it("calcula sobre os dias já passados do mês", () => {
    // 18 dias decorridos em outubro, 9 feitos → 50%
    const days = Array.from({ length: 9 }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`);
    expect(monthCompletion(days, "2026-01-01", today)).toBe(50);
  });

  it("conta a partir da criação, se o hábito é deste mês", () => {
    // criado dia 17: 2 dias decorridos, 2 feitos → 100%
    expect(monthCompletion(["2026-10-17", "2026-10-18"], "2026-10-17", today)).toBe(100);
  });

  it("considera dias marcados antes da criação", () => {
    // criado dia 17, mas marcado desde o dia 15: 4 dias decorridos, 3 feitos → 75%
    expect(monthCompletion(["2026-10-15", "2026-10-16", "2026-10-18"], "2026-10-17", today)).toBe(75);
  });

  it("ignora dias de outros meses", () => {
    expect(monthCompletion(["2026-09-30"], "2026-01-01", today)).toBe(0);
  });
});
