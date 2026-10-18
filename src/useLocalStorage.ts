import { useEffect, useState } from "react";

// Igual ao useState, mas o valor sobrevive ao recarregar a página.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Navegação privada ou armazenamento cheio: segue só em memória.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
