import { useState, useCallback } from 'react';
import { SnippetId } from '../types';

const STORAGE_KEY = 'snippetFavorites';

function readFromStorage(): SnippetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SnippetId[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: SnippetId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<SnippetId[]>(readFromStorage);

  const toggle = useCallback((id: SnippetId) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: SnippetId) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
