import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseBirthday(bdayStr?: string): { day: number; month: number; year?: number } | null {
  if (!bdayStr || typeof bdayStr !== 'string') return null;
  const str = bdayStr.trim();
  if (!str) return null;

  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      // ISO YYYY-MM-DD
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d };
      }
    } else if (parts.length === 2) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      if (p1 <= 12 && p2 <= 31) return { month: p1, day: p2 };
      if (p2 <= 12 && p1 <= 31) return { month: p2, day: p1 };
    }
  } else if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d };
      }
    } else if (parts.length === 2) {
      // DD/MM
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { month: m, day: d };
      }
    }
  }
  return null;
}
