import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// returns economy rate
export function getER(runs: number, overs: number, balls: number): string {
  if (runs === 0 || (overs === 0 && balls === 0)) return "0";
  return (runs / (overs + (balls / 6))).toFixed(2);
}

// returns strike rate
export function getSR(runs: number, balls: number): string {
  if (runs === 0 || balls === 0) return "0";
  return ((runs / balls) * 100).toFixed(2);
}