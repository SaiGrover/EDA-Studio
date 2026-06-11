import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CHART_PALETTE = [
  '#e8778f',
  '#9b89d4',
  '#6fa896',
  '#d4894a',
  '#6a9fc4',
  '#d4537e',
  '#63992c',
  '#c4a640',
];

export const CHART_PALETTE_ALPHA = [
  'rgba(232,119,143,0.7)',
  'rgba(155,137,212,0.7)',
  'rgba(111,168,150,0.7)',
  'rgba(212,137,74,0.7)',
  'rgba(106,159,196,0.7)',
  'rgba(212,83,126,0.7)',
];

export const COLOR_MAP: Record<string, [string, string]> = {
  rose: ['#c44d6a', '#fdf0f3'],
  lavender: ['#5e4aaa', '#f3f0fb'],
  sage: ['#3d7a6b', '#eef5f2'],
  peach: ['#9a5520', '#fef5ef'],
  sky: ['#2d6a96', '#eef4f9'],
  sand: ['#8a6540', '#faf5ed'],
};
