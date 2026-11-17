import { useEffect, useState } from "react";
import type { Task, CreateTask } from "../../../shared/task";
import { tasksApi } from "../services/tasks";
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function reload() {
    setLoading(true);
    setError("");
    try {
      setTasks(await tasksApi.list());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  async function create(input: CreateTask) {
    const task = await tasksApi.create(input);
    setTasks((previous) => [task, ...previous]);
  }
  return { tasks, loading, error, reload, create };
}
