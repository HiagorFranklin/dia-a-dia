import { lastWeeks, toDayKey } from "./dates";

type Props = {
  days: string[];
  color: string;
  onToggle: (day: string) => void;
};

const WEEKS = 13; // ~3 meses

const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" });

export function Heatmap({ days, color, onToggle }: Props) {
  // Set em vez de array: checar "este dia foi feito?" fica O(1) para cada quadradinho.
  const done = new Set(days);
  const today = toDayKey(new Date());

  return (
    <div className="heatmap" role="group" aria-label="Histórico dos últimos 3 meses">
      {lastWeeks(WEEKS).map((date) => {
        const key = toDayKey(date);
        const isDone = done.has(key);
        return (
          <button
            key={key}
            className={`cell ${key === today ? "today" : ""}`}
            style={isDone ? { background: color } : undefined}
            onClick={() => onToggle(key)}
            title={`${dateLabel.format(date)}${isDone ? " ✓" : ""}`}
            aria-label={`${dateLabel.format(date)}: ${isDone ? "feito" : "não feito"}`}
            aria-pressed={isDone}
          />
        );
      })}
    </div>
  );
}
