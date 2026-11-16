export const statuses = ['pending','in_progress','blocked','delivered'] as const;
export const priorities = ['low','medium','high'] as const;
export interface Task {
  id: string; title: string; description?: string; subject: string;
  status: typeof statuses[number]; priority: typeof priorities[number];
  isFavorite: boolean; dueDate?: string; createdAt: string;
}
export type CreateTask = Omit<Task,'id'|'createdAt'|'status'|'priority'|'isFavorite'> & Partial<Pick<Task,'status'|'priority'|'isFavorite'>>;
