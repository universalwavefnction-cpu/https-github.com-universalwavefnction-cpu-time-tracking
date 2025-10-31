import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#2563eb' }, // blue-600
  { id: 'meeting', name: 'Meeting', color: '#7c3aed' }, // violet-600
  { id: 'break', name: 'Break', color: '#059669' }, // emerald-600
  { id: 'exercise', name: 'Exercise', color: '#ea580c' }, // orange-600
  { id: 'meals', name: 'Meals', color: '#d97706' }, // amber-600
  { id: 'personal', name: 'Personal', color: '#db2777' }, // pink-600
  { id: 'commute', name: 'Commute', color: '#64748b' }, // slate-500
  { id: 'learning', name: 'Learning', color: '#0891b2' }, // cyan-600
  { id: 'social', name: 'Social', color: '#dc2626' }, // red-600
  { id: 'entertainment', name: 'Entertainment', color: '#c026d3' }, // fuchsia-600
  { id: 'household', name: 'Household', color: '#65a30d' }, // lime-600
  { id: 'sleep', name: 'Sleep', color: '#0d9488' }, // teal-600
];

export const TIME_SLOTS: string[] = Array.from({ length: (23 - 6 + 1) * 4 }, (_, i) => {
  const hour = 6 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});