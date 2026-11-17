import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ListTodo,
  CircleDashed,
  Check,
  Search,
  AlertTriangle,
} from "lucide-react";
import type { ProjectDetail, Task, TaskInput } from "../../../shared/contracts";
import { api, ApiError, errorMessage } from "../services/api";
import { ProjectForm } from "./ProjectForm";
import { TaskForm } from "./TaskForm";
import { TaskCard, statusLabels } from "./TaskCard";
import { TaskInspector } from "./TaskInspector";
import { Modal } from "./Modal";

export function ProjectWorkspace({
  projectId,
  onBack,
}: {
  projectId: string;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editProject, setEditProject] = useState(false);
  const [deleteProject, setDeleteProject] = useState(false);
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [favorites, setFavorites] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setDetail(await api.project(projectId));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [projectId]);
  async function mutate(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setDetail(await api.project(projectId));
      setSuccess(message);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          const latest = await api.project(projectId);
          setDetail(latest);
          setEditor((current) =>
            current && current !== "new"
              ? (latest.tasks.find((task) => task.id === current.id) ?? null)
              : current,
          );
        } catch {
          /* Preserve the mutation error; session handling remains in the HTTP client. */
        }
        setError(
          `${error.message} Se actualizaron los datos disponibles. Revisá el estado actual antes de reintentar.`,
        );
      } else setError(errorMessage(error));
      return false;
    } finally {
      setBusy(false);
    }
  }
  function clearNotice() {
    setError("");
    setSuccess("");
  }
  if (loading && !detail) return <p role="status">Cargando proyecto…</p>;
  if (!detail)
    return (
      <div className="empty">
        <h1>No se pudo abrir el proyecto</h1>
        <p role="alert">{error}</p>
        <button onClick={() => void load()}>Reintentar</button>
        <button onClick={onBack}>Volver a proyectos</button>
      </div>
    );
  const { project, tasks, progress, conflicts } = detail;
  const currentTask = tasks.find((task) => task.id === inspectingId);
  const filtered = tasks.filter(
    (task) =>
      (!subject || task.subject === subject) &&
      (!status || task.status === status) &&
      (!favorites || task.isFavorite) &&
      `${task.title} ${task.description}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
  );
  async function saveTask(input: TaskInput) {
    return mutate(
      () =>
        editor && editor !== "new"
          ? api.editTask(editor, input)
          : api.createTask(projectId, input),
      editor === "new"
        ? "Tarea creada y guardada."
        : "Cambios de la tarea guardados.",
    );
  }
  return (
    <>
      <button
        className="text-button back-link"
        onClick={onBack}
        disabled={busy}
      >
        <ArrowLeft size={16} />
        Todos los proyectos
      </button>
      <header className="project-heading">
        <div>
          <h1>{project.name}</h1>
          <p className="page-subtitle">
            {project.description ||
              "Organizá las tareas y entregas de este proyecto."}
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="icon-button"
            aria-label="Editar proyecto"
            disabled={busy}
            onClick={() => {
              clearNotice();
              setEditProject(true);
            }}
          >
            <Pencil size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Eliminar proyecto"
            disabled={busy || tasks.length > 0}
            title={
              tasks.length
                ? "El proyecto debe estar vacío para eliminarlo."
                : "Eliminar proyecto"
            }
            onClick={() => {
              clearNotice();
              setDeleteProject(true);
            }}
          >
            <Trash2 size={18} />
          </button>
          <button
            className="primary"
            disabled={busy}
            onClick={() => {
              clearNotice();
              setEditor("new");
            }}
          >
            <Plus size={18} />
            Nueva tarea
          </button>
        </div>
      </header>
      <section className="progress-panel" aria-label="Progreso del proyecto">
        <div>
          <span>Progreso del proyecto</span>
          <strong>{progress.percentage}%</strong>
          <small>
            {progress.delivered} de {progress.total} tareas entregadas
          </small>
        </div>
        <progress value={progress.percentage} max={100}>
          {progress.percentage}%
        </progress>
      </section>
      <div className="workspace">
        <section className="task-area" aria-label="Gestión de tareas">
          <div className="stats">
            {[
              { label: "Total", value: tasks.length, icon: ListTodo },
              {
                label: "En desarrollo",
                value: tasks.filter((task) => task.status === "in_progress")
                  .length,
                icon: CircleDashed,
              },
              { label: "Entregadas", value: progress.delivered, icon: Check },
            ].map(({ label, value, icon: Icon }) => (
              <div className="stat" key={label}>
                <Icon />
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
          {conflicts.length ? (
            <div className="conflict-alert">
              <AlertTriangle size={20} />
              <div>
                <strong>Varias entregas muy cerca</strong>
                <p>
                  Hay al menos tres tareas no entregadas en un período de tres
                  días. Revisá sus prioridades y fechas.
                </p>
              </div>
            </div>
          ) : null}
          <div className="filters">
            <label className="search">
              <span className="sr-only">Buscar tareas</span>
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título o descripción…"
              />
            </label>
            <label>
              Materia
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option value="">Todas las materias</option>
                {[...new Set(tasks.map((task) => task.subject))]
                  .sort()
                  .map((value) => (
                    <option key={value}>{value}</option>
                  ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Todos los estados</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="check favorites">
            <input
              type="checkbox"
              checked={favorites}
              onChange={(event) => setFavorites(event.target.checked)}
            />
            Solo favoritas
          </label>
          {success ? (
            <p className="success" role="status">
              {success}
            </p>
          ) : null}
          {error &&
          !editor &&
          !currentTask &&
          !editProject &&
          !deleteProject ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          {filtered.length ? (
            <div className="task-list" aria-busy={busy}>
              {filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  busy={busy}
                  onEdit={() => {
                    clearNotice();
                    setEditor(task);
                  }}
                  onManage={() => {
                    clearNotice();
                    setInspectingId(task.id);
                  }}
                  onFavorite={() =>
                    void mutate(
                      () =>
                        api.editTask(task, {
                          title: task.title,
                          description: task.description,
                          subject: task.subject,
                          priority: task.priority,
                          dueDate: task.dueDate,
                          isFavorite: !task.isFavorite,
                        }),
                      "Favorito actualizado.",
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <ListTodo size={38} />
              <h2>
                {tasks.length
                  ? "Sin coincidencias"
                  : "Un proyecto, un primer paso"}
              </h2>
              <p>
                {tasks.length
                  ? "Probá con otros filtros."
                  : "Creá la primera tarea para empezar a avanzar."}
              </p>
              {!tasks.length ? (
                <button className="primary" onClick={() => setEditor("new")}>
                  Crear mi primera tarea
                </button>
              ) : null}
            </div>
          )}
        </section>
        {editor ? (
          <TaskForm
            key={editor === "new" ? "new" : `${editor.id}:${editor.version}`}
            task={editor === "new" ? undefined : editor}
            error={error}
            onClose={() => {
              setEditor(null);
              setError("");
            }}
            onSave={saveTask}
          />
        ) : null}
      </div>
      {editProject ? (
        <ProjectForm
          project={project}
          error={error}
          onClose={() => {
            setEditProject(false);
            setError("");
          }}
          onSave={(name, description) =>
            mutate(
              () => api.editProject(project, name, description),
              "Proyecto actualizado.",
            )
          }
        />
      ) : null}
      {deleteProject ? (
        <Modal
          title="Eliminar proyecto"
          busy={busy}
          onClose={() => setDeleteProject(false)}
        >
          <p>¿Eliminar el proyecto vacío «{project.name}»?</p>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-actions">
            <button disabled={busy} onClick={() => setDeleteProject(false)}>
              Cancelar
            </button>
            <button
              className="danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await api.deleteProject(project);
                  onBack();
                } catch (error) {
                  setError(errorMessage(error));
                  setBusy(false);
                }
              }}
            >
              Confirmar eliminación
            </button>
          </div>
        </Modal>
      ) : null}
      {currentTask ? (
        <TaskInspector
          task={currentTask}
          tasks={tasks}
          busy={busy}
          error={error}
          onClose={() => {
            setInspectingId(null);
            setError("");
          }}
          onStatus={(status) =>
            mutate(() => api.status(currentTask, status), "Estado actualizado.")
          }
          onAddDependency={(id) =>
            mutate(
              () => api.addDependency(currentTask, id),
              "Dependencia agregada.",
            )
          }
          onRemoveDependency={(id) =>
            mutate(
              () => api.removeDependency(currentTask, id),
              "Dependencia quitada.",
            )
          }
          onDelete={() =>
            mutate(() => api.deleteTask(currentTask), "Tarea eliminada.")
          }
        />
      ) : null}
    </>
  );
}
