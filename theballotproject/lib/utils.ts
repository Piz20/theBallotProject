import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export interface SearchOptions<T> {
  query: string;
  items: T[];
  keys: (keyof T)[];
  exactMatch?: boolean; // optionnel : true pour chercher uniquement les correspondances exactes
}

/**
 * Fonction de recherche multi-champs, insensible à la casse, avec option de correspondance exacte.
 */
export function searchItems<T>({ query, items, keys, exactMatch = false }: SearchOptions<T>): T[] {
  if (!query.trim()) return items;

  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    return keys.some((key) => {
      const value = item[key];
      if (typeof value !== 'string') return false;

      const normalizedValue = value.toLowerCase();
      return exactMatch
        ? normalizedValue === normalizedQuery
        : normalizedValue.includes(normalizedQuery);
    });
  });
}
