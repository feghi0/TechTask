export const taskStatuses = ['pending', 'in_progress', 'blocked', 'delivered'] as const;
export const taskPriorities = ['low', 'medium', 'high'] as const;
export type TaskStatus = typeof taskStatuses[number];
export type TaskPriority = typeof taskPriorities[number];
export interface User { id: string; email: string; }
export interface Project { id: string; name: string; description: string; createdAt: string; version: number; }
export interface Task {
  id: string; projectId: string; title: string; description: string; subject: string;
  status: TaskStatus; priority: TaskPriority; isFavorite: boolean; dueDate: string | null;
  createdAt: string; version: number; dependencyIds: string[];
  urgency: 'none' | 'overdue' | 'immediate' | 'soon';
}
export interface TaskInput { title: string; description?: string; subject: string; priority?: TaskPriority; isFavorite?: boolean; dueDate?: string | null; }
export interface History { id: string; taskId: string; fromStatus: TaskStatus; toStatus: TaskStatus; createdAt: string; }
export interface Progress { total: number; delivered: number; percentage: number; }
export interface Conflict { startDate: string; endDate: string; taskIds: string[]; }
export interface ProjectDetail { project: Project; tasks: Task[]; progress: Progress; conflicts: Conflict[]; }
