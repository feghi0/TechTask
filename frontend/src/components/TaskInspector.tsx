import { useEffect, useState, type FormEvent } from "react";
import { Trash2, Link2 } from "lucide-react";
import type { History, Task, TaskStatus } from "../../../shared/contracts";
import { api, errorMessage } from "../services/api";
import { statusLabels } from "./TaskCard";
import { Modal } from "./Modal";

const transitions: Record<TaskStatus, TaskStatus[]> = {
  pending: ["in_progress", "blocked"],
  in_progress: ["pending", "blocked", "delivered"],
  blocked: ["pending", "in_progress"],
  delivered: ["in_progress"],
};

export function TaskInspector({
  task,
  tasks,
  busy,
  error,
  onClose,
  onStatus,
  onAddDependency,
  onRemoveDependency,
  onDelete,
}: {
  task: Task;
  tasks: Task[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onStatus: (status: TaskStatus) => Promise<boolean>;
  onAddDependency: (id: string) => Promise<boolean>;
  onRemoveDependency: (id: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [status, setStatus] = useState<TaskStatus>(transitions[task.status][0]);
  const [dependency, setDependency] = useState("");
  const [history, setHistory] = useState<History[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [historyAttempt, setHistoryAttempt] = useState(0);
  useEffect(() => {
    setStatus(transitions[task.status][0]);
  }, [task.status]);
  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    setHistoryError("");
    api
      .history(task)
      .then((value) => {
        if (active) setHistory(value);
      })
      .catch((error) => {
        if (active) setHistoryError(errorMessage(error));
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [task.id, task.version, historyAttempt]);
  const dependencies = tasks.filter((candidate) =>
    task.dependencyIds.includes(candidate.id),
  );
  const pending = dependencies.filter(
    (candidate) => candidate.status !== "delivered",
  );
  const available = tasks.filter(
    (candidate) =>
      candidate.id !== task.id && !task.dependencyIds.includes(candidate.id),
  );
  async function changeStatus(event: FormEvent) {
    event.preventDefault();
    await onStatus(status);
  }
  async function addDependency(event: FormEvent) {
    event.preventDefault();
    if (dependency && (await onAddDependency(dependency))) setDependency("");
  }
  return (
    <Modal title={task.title} onClose={onClose} busy={busy}>
      <div className="inspector-body">
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        <section>
          <h3>Estado de la tarea</h3>
          <p className="muted">
            Estado actual: <strong>{statusLabels[task.status]}</strong>
          </p>
          {pending.length ? (
            <p className="notice">
              No se puede entregar: faltan{" "}
              {pending.map((item) => item.title).join(", ")}.
            </p>
          ) : null}
          <form onSubmit={changeStatus}>
            <fieldset disabled={busy}>
              <label>
                Nuevo estado
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TaskStatus)
                  }
                >
                  {transitions[task.status].map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="primary">
                {busy ? "Guardando…" : "Cambiar estado"}
              </button>
            </fieldset>
          </form>
          <small>
            Una entrega requiere que todas sus dependencias estén entregadas.
            Reabrir una tarea también debe preservar las entregas que dependen
            de ella.
          </small>
        </section>
        <section>
          <h3>
            <Link2 size={18} />
            Dependencias
          </h3>
          <p className="muted">
            Las tareas requeridas deben pertenecer a este proyecto. No se
            permiten ciclos.
          </p>
          {dependencies.length ? (
            <ul className="dependency-list">
              {dependencies.map((item) => (
                <li key={item.id}>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{statusLabels[item.status]}</small>
                  </span>
                  <button
                    type="button"
                    onClick={() => void onRemoveDependency(item.id)}
                    disabled={busy}
                    aria-label={`Quitar dependencia ${item.title}`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Esta tarea no tiene dependencias.</p>
          )}
          {task.status === "delivered" ? (
            <p className="notice">
              Reabrí la tarea antes de agregar una dependencia.
            </p>
          ) : available.length ? (
            <form onSubmit={addDependency}>
              <fieldset disabled={busy}>
                <label>
                  Tarea requerida
                  <select
                    value={dependency}
                    onChange={(event) => setDependency(event.target.value)}
                    required
                  >
                    <option value="">Seleccionar tarea</option>
                    {available.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" disabled={!dependency}>
                  Agregar dependencia
                </button>
              </fieldset>
            </form>
          ) : (
            <p className="muted">
              Creá otra tarea en el proyecto para relacionarla.
            </p>
          )}
        </section>
        <section>
          <h3>Historial de estados</h3>
          {historyLoading ? (
            <p role="status">Cargando historial…</p>
          ) : historyError ? (
            <p className="error" role="alert">
              {historyError}
              <button onClick={() => setHistoryAttempt((value) => value + 1)}>
                Reintentar historial
              </button>
            </p>
          ) : history.length ? (
            <ol className="history-list">
              {history.map((entry) => (
                <li key={entry.id}>
                  <span>
                    {statusLabels[entry.fromStatus]} →{" "}
                    <strong>{statusLabels[entry.toStatus]}</strong>
                  </span>
                  <time dateTime={entry.createdAt}>
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Argentina/Buenos_Aires",
                    }).format(new Date(entry.createdAt))}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Todavía no hubo cambios de estado.</p>
          )}
        </section>
        <section className="danger-zone">
          <h3>Eliminar tarea</h3>
          <p className="muted">
            Solo se permite si no está entregada y ninguna tarea activa depende
            de ella.
          </p>
          {confirmDelete ? (
            <div className="delete-confirm">
              <p>¿Eliminar «{task.title}» del proyecto?</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar eliminación
              </button>
              <button
                type="button"
                disabled={busy}
                className="danger"
                onClick={async () => {
                  if (await onDelete()) onClose();
                }}
              >
                Confirmar eliminación
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy || task.status === "delivered"}
              className="danger"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              Eliminar tarea
            </button>
          )}
        </section>
      </div>
    </Modal>
  );
}
