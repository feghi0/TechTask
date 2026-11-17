import type { CreateTask, Task } from "../../../shared/task";
async function request<T>(options?: RequestInit): Promise<T> {
  const response = await fetch("/api/tasks", options);
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error?.fields
        ? Object.values(body.error.fields).join(" ")
        : (body.error?.message ?? "Error de conexión."),
    );
  return body.data as T;
}
export const tasksApi = {
  list: () => request<Task[]>(),
  create: (task: CreateTask) =>
    request<Task>({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }),
};
