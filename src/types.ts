export type Habit = {
  id: string;
  name: string;
  color: string;
  createdAt: string; // "YYYY-MM-DD"
};

// Para cada hábito, a lista de dias em que ele foi cumprido ("YYYY-MM-DD").
export type Completions = Record<string, string[]>;
