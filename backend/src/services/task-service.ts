import { randomUUID } from "node:crypto";
import {
  taskPriorities,
  taskStatuses,
  type ProjectDetail,
  type Task,
  type TaskStatus,
} from "../../../shared/contracts";
import { AppError } from "../middleware/errors";
import type { TaskRepository } from "../repositories/task-repository";
import { date, invalid, object, text, uuid, version } from "./validation";
import { projectConflicts } from "./calendar";

const editable = [
  "title",
  "description",
  "subject",
  "priority",
  "isFavorite",
  "dueDate",
];
const conflict = (code: string, message: string) =>
  new AppError(409, code, message);
function requireVersion(body: Record<string, unknown>, current: number) {
  if (version(body.version) !== current)
    throw conflict(
      "VERSION_CONFLICT",
      "La tarea o proyecto cambió. Recargá antes de volver a intentar.",
    );
}
function taskFields(body: Record<string, unknown>, previous?: Task) {
  const title =
    body.title === undefined && previous
      ? previous.title
      : text(body.title, "Título", 3, 60);
  const subject =
    body.subject === undefined && previous
      ? previous.subject
      : text(body.subject, "Materia", 1, 100);
  const description =
    body.description === undefined
      ? (previous?.description ?? "")
      : text(body.description, "Descripción", 0, 10000);
  const priority =
    body.priority === undefined
      ? (previous?.priority ?? "medium")
      : body.priority;
  if (!taskPriorities.some((value) => value === priority))
    throw invalid("Prioridad no permitida.");
  if (body.isFavorite !== undefined && typeof body.isFavorite !== "boolean")
    throw invalid("Favorita debe ser un booleano.");
  return {
    title,
    subject,
    description,
    priority: priority as Task["priority"],
    isFavorite:
      body.isFavorite === undefined
        ? (previous?.isFavorite ?? false)
        : (body.isFavorite as boolean),
    dueDate:
      body.dueDate === undefined && previous
        ? previous.dueDate
        : date(body.dueDate),
  };
}
export class TaskService {
  constructor(private repository: TaskRepository) {}
  projects(owner: string) {
    return this.repository.projects(owner);
  }
  async createProject(owner: string, input: unknown) {
    const body = object(input, ["name", "description"]);
    return this.repository.createProject(
      owner,
      randomUUID(),
      text(body.name, "Nombre", 3, 80),
      body.description === undefined
        ? ""
        : text(body.description, "Descripción", 0, 4000),
    );
  }
  async projectDetail(owner: string, id: string): Promise<ProjectDetail> {
    uuid(id);
    const project = await this.repository.project(owner, id);
    const tasks = await this.repository.tasks(owner, id);
    const delivered = tasks.filter(
      (task) => task.status === "delivered",
    ).length;
    return {
      project,
      tasks,
      progress: {
        total: tasks.length,
        delivered,
        percentage: tasks.length
          ? Math.round((delivered / tasks.length) * 100)
          : 0,
      },
      conflicts: projectConflicts(tasks),
    };
  }
  async updateProject(owner: string, id: string, input: unknown) {
    uuid(id);
    const body = object(input, ["version", "name", "description"]);
    if (body.name === undefined && body.description === undefined)
      throw invalid("No hay cambios para guardar.");
    return this.repository.transaction(async (repo) => {
      const current = await repo.project(owner, id, true);
      requireVersion(body, current.version);
      await repo.updateProject(
        id,
        body.name === undefined
          ? current.name
          : text(body.name, "Nombre", 3, 80),
        body.description === undefined
          ? current.description
          : text(body.description, "Descripción", 0, 4000),
      );
      return repo.project(owner, id);
    });
  }
  async deleteProject(owner: string, id: string, input: unknown) {
    uuid(id);
    const body = object(input, ["version"]);
    await this.repository.transaction(async (repo) => {
      const project = await repo.project(owner, id, true);
      requireVersion(body, project.version);
      const any = await repo.projectHasActiveTasks(id);
      if (any)
        throw conflict(
          "PROJECT_NOT_EMPTY",
          "El proyecto contiene tareas activas y no puede eliminarse.",
        );
      await repo.deleteProject(id);
    });
  }
  async list(owner: string, projectId?: string) {
    if (projectId) {
      uuid(projectId);
      await this.repository.project(owner, projectId);
    }
    return this.repository.tasks(owner, projectId);
  }
  get(owner: string, id: string) {
    return this.repository.task(owner, uuid(id));
  }
  async create(owner: string, projectId: string, input: unknown) {
    uuid(projectId);
    const body = object(input, editable);
    const fields = taskFields(body);
    return this.repository.transaction(async (repo) => {
      await repo.project(owner, projectId, true);
      const id = randomUUID();
      await repo.insertTask({ ...fields, id, projectId, status: "pending" });
      return repo.task(owner, id);
    });
  }
  private async mutate(
    owner: string,
    id: string,
    input: unknown,
    allowed: string[],
    operation: (
      repo: TaskRepository,
      task: Task,
      body: Record<string, unknown>,
    ) => Promise<void>,
    returnDeleted = false,
  ): Promise<Task> {
    uuid(id);
    const body = object(input, ["version", ...allowed]);
    version(body.version);
    return this.repository.transaction(async (repo) => {
      const initial = await repo.task(owner, id);
      await repo.project(owner, initial.projectId, true);
      const task = await repo.task(owner, id);
      requireVersion(body, task.version);
      await operation(repo, task, body);
      return returnDeleted ? task : repo.task(owner, id);
    });
  }
  update(owner: string, id: string, input: unknown) {
    return this.mutate(owner, id, input, editable, async (repo, task, body) => {
      if (!editable.some((key) => Object.hasOwn(body, key)))
        throw invalid("No hay cambios para guardar.");
      await repo.updateTask({ ...task, ...taskFields(body, task) });
    });
  }
  async delete(owner: string, id: string, input: unknown) {
    await this.mutate(
      owner,
      id,
      input,
      [],
      async (repo, task) => {
        if (task.status === "delivered")
          throw conflict(
            "TASK_DELIVERED",
            "No se puede eliminar una tarea entregada.",
          );
        if (await repo.dependents(id))
          throw conflict(
            "TASK_REFERENCED",
            "Otras tareas dependen de esta tarea.",
          );
        await repo.deleteTask(id);
      },
      true,
    );
  }
  status(owner: string, id: string, input: unknown) {
    return this.mutate(
      owner,
      id,
      input,
      ["status"],
      async (repo, task, body) => {
        if (!taskStatuses.some((value) => value === body.status))
          throw invalid("Estado no permitido.");
        const next = body.status as TaskStatus;
        const transitions: Record<TaskStatus, TaskStatus[]> = {
          pending: ["in_progress", "blocked"],
          in_progress: ["pending", "blocked", "delivered"],
          blocked: ["pending", "in_progress"],
          delivered: ["in_progress"],
        };
        if (!transitions[task.status].includes(next))
          throw conflict(
            "INVALID_TRANSITION",
            "Este cambio de estado no está permitido.",
          );
        if (next === "delivered") {
          for (const dependency of task.dependencyIds) {
            if ((await repo.task(owner, dependency)).status !== "delivered")
              throw conflict(
                "DEPENDENCY_PENDING",
                "No se puede entregar: hay dependencias pendientes.",
              );
          }
        }
        if (
          task.status === "delivered" &&
          (await repo.dependents(task.id, true))
        )
          throw conflict(
            "DELIVERED_DEPENDENT",
            "No se puede reabrir: una tarea entregada depende de esta.",
          );
        await repo.setStatus(id, next);
        await repo.addHistory(randomUUID(), id, task.status, next);
      },
    );
  }
  addDependency(owner: string, id: string, input: unknown) {
    return this.mutate(
      owner,
      id,
      input,
      ["dependencyId"],
      async (repo, task, body) => {
        const dependencyId = uuid(body.dependencyId);
        if (task.status === "delivered")
          throw conflict(
            "TASK_DELIVERED",
            "Reabrí la tarea antes de modificar sus dependencias.",
          );
        if (dependencyId === id)
          throw conflict(
            "DEPENDENCY_CYCLE",
            "Una tarea no puede depender de sí misma.",
          );
        const dependency = await repo.task(owner, dependencyId);
        if (dependency.projectId !== task.projectId)
          throw conflict(
            "CROSS_PROJECT_DEPENDENCY",
            "La dependencia debe pertenecer al mismo proyecto.",
          );
        if (task.dependencyIds.includes(dependencyId))
          throw conflict("DUPLICATE_DEPENDENCY", "La dependencia ya existe.");
        if (await repo.hasCycle(id, dependencyId))
          throw conflict(
            "DEPENDENCY_CYCLE",
            "La dependencia generaría un ciclo.",
          );
        await repo.addDependency(id, dependencyId);
        await repo.bumpTask(id);
      },
    );
  }
  removeDependency(
    owner: string,
    id: string,
    dependencyId: string,
    input: unknown,
  ) {
    uuid(dependencyId);
    return this.mutate(owner, id, input, [], async (repo, task) => {
      if (!task.dependencyIds.includes(dependencyId))
        throw new AppError(404, "NOT_FOUND", "Dependencia no encontrada.");
      await repo.removeDependency(id, dependencyId);
      await repo.bumpTask(id);
    });
  }
  async history(owner: string, id: string) {
    await this.get(owner, id);
    return this.repository.history(id);
  }
}
