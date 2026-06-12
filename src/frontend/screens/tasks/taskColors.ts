import type { TaskColor } from '../../application/state';

export type TaskColorId =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'teal';

export const TASK_COLORS: Array<{ id: TaskColorId; value: TaskColor }> = [
  { id: 'red', value: '#DC2626' },
  { id: 'orange', value: '#EA580C' },
  { id: 'yellow', value: '#CA8A04' },
  { id: 'green', value: '#16A34A' },
  { id: 'blue', value: '#2563EB' },
  { id: 'purple', value: '#7C3AED' },
  { id: 'pink', value: '#DB2777' },
  { id: 'teal', value: '#0D9488' },
];

export const DEFAULT_TASK_COLOR = TASK_COLORS[4].value;

export function findTaskColorId(value: TaskColor): TaskColorId | null {
  return TASK_COLORS.find((color) => color.value === value)?.id ?? null;
}
