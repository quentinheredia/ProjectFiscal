import { type ClassValue, clsx } from 'clsx';

/**
 * Joins class names, skipping falsy ones. It does not resolve Tailwind conflicts (no tailwind-merge,
 * which would add about 8 kB to every page), so callers must not pass classes that fight each other.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
