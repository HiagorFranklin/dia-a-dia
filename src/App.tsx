import { useState, type ChangeEvent, type FormEvent } from "react";
import { createBackup, parseBackup } from "./backup";
import { currentStreak, longestStreak, monthCompletion, toDayKey } from "./dates";
import { Heatmap } from "./Heatmap";
import type { Completions, Habit } from "./types";
import { useLocalStorage } from "./useLocalStorage";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ec4899"];

export default function App() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
  const [completions, setCompletions] = useLocalStorage<Completions>("completions", {});
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const today = toDayKey(new Date());

  function addHabit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: trimmed, color, createdAt: today }]);
    setName("");
  }

  function removeHabit(id: string) {
    if (!confirm("Remover este hábito e todo o histórico dele?")) return;
    setHabits(habits.filter((h) => h.id !== id));
    const { [id]: _removed, ...rest } = completions;
    setCompletions(rest);
  }

  function toggleDay(id: string, day: string) {
    const days = completions[id] ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setCompletions({ ...completions, [id]: next });
  }

  function exportBackup() {
    const json = JSON.stringify(createBackup(habits, completions), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `habitos-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!file) return;
    try {
      const backup = parseBackup(await file.text());
      const message = `Substituir seus dados atuais por ${backup.habits.length} hábito(s) do backup?`;
      if (!confirm(message)) return;
      setHabits(backup.habits);
      setCompletions(backup.completions);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível ler o backup.");
    }
  }

  return (
    <main className="container">
      <h1>Meus Hábitos</h1>

      <form className="add-form" onSubmit={addHabit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Novo hábito (ex.: Ler 10 páginas)"
          aria-label="Nome do hábito"
        />
        <div className="colors">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${c === color ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
        <button type="submit">Adicionar</button>
      </form>

      {habits.length === 0 ? (
        <p className="empty">Nenhum hábito ainda. Comece com algo pequeno!</p>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => {
            const days = completions[habit.id] ?? [];
            const doneToday = days.includes(today);
            const streak = currentStreak(days);
            const record = longestStreak(days);
            return (
              <li key={habit.id} className="habit" style={{ borderLeftColor: habit.color }}>
                <div className="habit-row">
                  <button
                    className={`check ${doneToday ? "done" : ""}`}
                    style={doneToday ? { background: habit.color, borderColor: habit.color } : undefined}
                    onClick={() => toggleDay(habit.id, today)}
                    aria-label={doneToday ? "Desmarcar hoje" : "Marcar hoje"}
                  >
                    {doneToday ? "✓" : ""}
                  </button>
                  <span className="habit-name">{habit.name}</span>
                  <span className="streak" title="Dias seguidos">
                    🔥 {streak}
                  </span>
                  <button className="remove" onClick={() => removeHabit(habit.id)} aria-label="Remover">
                    ×
                  </button>
                </div>
                <Heatmap days={days} color={habit.color} onToggle={(day) => toggleDay(habit.id, day)} />
                <div className="stats">
                  <span>
                    🏆 Recorde: <strong>{record}</strong> {record === 1 ? "dia" : "dias"}
                  </span>
                  <span>
                    📅 Este mês: <strong>{monthCompletion(days, habit.createdAt)}%</strong>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="backup">
        <button onClick={exportBackup} disabled={habits.length === 0}>
          Exportar backup
        </button>
        <label>
          Importar backup
          <input type="file" accept="application/json,.json" onChange={importBackup} hidden />
        </label>
      </footer>
    </main>
  );
}
