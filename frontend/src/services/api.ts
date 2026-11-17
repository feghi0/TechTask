import type {
  Project,
  ProjectDetail,
  Task,
  TaskInput,
  TaskStatus,
  User,
  History,
} from "../../../shared/contracts";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "include",
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "No se pudo conectar. Revisá tu conexión y volvé a intentar.",
    );
  }
  if (response.status === 204) return undefined as T;
  let result: {
    data?: T;
    error?: {
      code?: string;
      message?: string;
      fields?: Record<string, string>;
    };
  };
  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "El servidor devolvió una respuesta inesperada.",
    );
  }
  if (!response.ok) {
    const message = result.error?.fields
      ? Object.values(result.error.fields).join(" ")
      : (result.error?.message ?? "No se pudo completar la operación.");
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(
      response.status,
      result.error?.code ?? "REQUEST_ERROR",
      message,
    );
  }
  return result.data as T;
}

export const api = {
  me: () => request<User>("/auth/me"),
  login: (email: string, password: string) =>
    request<User>("/auth/login", "POST", { email, password }),
  register: (email: string, password: string) =>
    request<User>("/auth/register", "POST", { email, password }),
  logout: () => request<void>("/auth/logout", "POST", {}),
  projects: () => request<Project[]>("/projects"),
  project: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  createProject: (name: string, description: string) =>
    request<Project>("/projects", "POST", { name, description }),
  editProject: (project: Project, name: string, description: string) =>
    request<Project>(`/projects/${project.id}`, "PATCH", {
      version: project.version,
      name,
      description,
    }),
  deleteProject: (project: Project) =>
    request<void>(`/projects/${project.id}`, "DELETE", {
      version: project.version,
    }),
  createTask: (projectId: string, task: TaskInput) =>
    request<Task>(`/projects/${projectId}/tasks`, "POST", task),
  editTask: (task: Task, input: TaskInput) =>
    request<Task>(`/tasks/${task.id}`, "PATCH", {
      ...input,
      version: task.version,
    }),
  deleteTask: (task: Task) =>
    request<void>(`/tasks/${task.id}`, "DELETE", { version: task.version }),
  status: (task: Task, status: TaskStatus) =>
    request<Task>(`/tasks/${task.id}/status`, "PATCH", {
      status,
      version: task.version,
    }),
  addDependency: (task: Task, dependencyId: string) =>
    request<Task>(`/tasks/${task.id}/dependencies`, "POST", {
      dependencyId,
      version: task.version,
    }),
  removeDependency: (task: Task, dependencyId: string) =>
    request<Task>(`/tasks/${task.id}/dependencies/${dependencyId}`, "DELETE", {
      version: task.version,
    }),
  history: (task: Task) => request<History[]>(`/tasks/${task.id}/history`),
};

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}
