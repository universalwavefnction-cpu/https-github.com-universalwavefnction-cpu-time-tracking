import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' }, // blue-500
  { id: 'meeting', name: 'Meeting', color: '#8b5cf6' }, // violet-500
  { id: 'break', name: 'Break', color: '#10b981' }, // emerald-500
  { id: 'exercise', name: 'Exercise', color: '#f97316' }, // orange-500
  { id: 'meals', name: 'Meals', color: '#f59e0b' }, // amber-500
  { id: 'personal', name: 'Personal', color: '#ec4899' }, // pink-500
  { id: 'commute', name: 'Commute', color: '#64748b' }, // slate-500
  { id: 'learning', name: 'Learning', color: '#06b6d4' }, // cyan-500
  { id: 'social', name: 'Social', color: '#ef4444' }, // red-500
  { id: 'entertainment', name: 'Entertainment', color: '#d946ef' }, // fuchsia-500
  { id: 'household', name: 'Household', color: '#84cc16' }, // lime-500
  { id: 'sleep', name: 'Sleep', color: '#14b8a6' }, // teal-500
];

export const TIME_SLOTS: string[] = Array.from({ length: (23 - 6 + 1) * 4 }, (_, i) => {
  const hour = 6 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
