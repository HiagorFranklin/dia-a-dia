import { describe, expect, it } from "vitest";
import { currentStreak, toDayKey } from "./dates";

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
