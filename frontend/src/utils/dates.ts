import type { Task } from "../../../shared/task";
export function urgency(
  task: Task,
  now = new Date(),
): "overdue" | "soon" | undefined {
  if (!task.dueDate || task.status === "delivered") return;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = (Date.parse(task.dueDate) - today) / 86400000;
  return days < 0 ? "overdue" : days <= 3 ? "soon" : undefined;
}
export const statusLabels = {
  pending: "Pendiente",
  in_progress: "En desarrollo",
  blocked: "Bloqueada",
  delivered: "Entregada",
};
export const priorityLabels = { low: "Baja", medium: "Media", high: "Alta" };
