import { useState, type FormEvent } from "react";
import { currentStreak, toDayKey } from "./dates";
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
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
