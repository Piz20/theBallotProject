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


/**
 * Checks if the start date is before the end date
 */
export const isStartDateBeforeEndDate = (
  startDate: string, 
  endDate: string
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Formats a date string to be used in datetime-local inputs
 * Input: ISO date string (e.g. '2025-06-01T08:00:00.000Z')
 * Output: Format suitable for datetime-local input (e.g. '2025-06-01T08:00')
 */
export const formatDateTimeForInput = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format: YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a date for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('fr-FR', options);
};