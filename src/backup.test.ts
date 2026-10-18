import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "./backup";

const habit = { id: "a", name: "Ler", color: "#22c55e", createdAt: "2026-10-01" };

describe("backup", () => {
  it("exporta e importa sem perder nada", () => {
    const backup = createBackup([habit], { a: ["2026-10-17", "2026-10-18"] });
    const restored = parseBackup(JSON.stringify(backup));
    expect(restored.habits).toEqual([habit]);
    expect(restored.completions).toEqual({ a: ["2026-10-17", "2026-10-18"] });
  });

  it("rejeita texto que não é JSON", () => {
    expect(() => parseBackup("isso não é json")).toThrow("JSON válido");
  });

  it("rejeita JSON de outro app", () => {
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrow("não é um backup");
  });

  it("rejeita hábito sem nome", () => {
    const bad = { version: 1, habits: [{ ...habit, name: undefined }], completions: {} };
    expect(() => parseBackup(JSON.stringify(bad))).toThrow("hábitos");
  });

  it("rejeita datas em formato errado", () => {
    const bad = { version: 1, habits: [habit], completions: { a: ["18/10/2026"] } };
    expect(() => parseBackup(JSON.stringify(bad))).toThrow("datas inválidas");
  });
});
