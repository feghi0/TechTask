import type { Conflict, Task, TaskStatus } from "../../../shared/contracts";

export function calendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function urgency(
  dueDate: string | null,
  status: TaskStatus,
  now = new Date(),
): Task["urgency"] {
  if (!dueDate || status === "delivered") return "none";
  const days = (Date.parse(dueDate) - Date.parse(calendarDate(now))) / 86400000;
  return days < 0
    ? "overdue"
    : days <= 3
      ? "immediate"
      : days <= 7
        ? "soon"
        : "none";
}

export function projectConflicts(tasks: Task[]): Conflict[] {
  const active = tasks
    .filter((task) => task.status !== "delivered" && task.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();
  for (const task of active) {
    const start = task.dueDate!;
    const end = new Date(Date.parse(start) + 2 * 86400000)
      .toISOString()
      .slice(0, 10);
    const members = active
      .filter((item) => item.dueDate! >= start && item.dueDate! <= end)
      .map((item) => item.id);
    const key = members.slice().sort().join(",");
    if (members.length >= 3 && !seen.has(key)) {
      conflicts.push({ startDate: start, endDate: end, taskIds: members });
      seen.add(key);
    }
  }
  return conflicts;
}
