
"use client";

import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        setState(JSON.parse(storedValue));
      } catch (e) {
        console.error("Error parsing persisted state", e);
      }
    }
    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, isHydrated]);

  return [state, setState];
}
