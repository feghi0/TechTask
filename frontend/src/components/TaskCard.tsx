import {
  BookOpen,
  CalendarDays,
  Star,
  Settings2,
  Pencil,
  Link2,
} from "lucide-react";
import type { Task } from "../../../shared/contracts";
export const statusLabels = {
  pending: "Pendiente",
  in_progress: "En desarrollo",
  blocked: "Bloqueada",
  delivered: "Entregada",
};
const priorityLabels = { low: "Baja", medium: "Media", high: "Alta" };
const urgencyLabels = {
  none: "",
  overdue: "Vencida",
  immediate: "Urgencia inmediata",
  soon: "Próxima a vencer",
};
export function TaskCard({
  task,
  onManage,
  onEdit,
  onFavorite,
  busy,
}: {
  task: Task;
  onManage: () => void;
  onEdit: () => void;
  onFavorite: () => void;
  busy: boolean;
}) {
  return (
    <article className="task-card" aria-label={task.title}>
      <button
        type="button"
        className={`icon-button favorite-toggle ${task.isFavorite ? "favorite" : ""}`}
        aria-label={`Favorita ${task.title}`}
        aria-pressed={task.isFavorite}
        disabled={busy}
        onClick={onFavorite}
      >
        <Star size={20} fill={task.isFavorite ? "currentColor" : "none"} />
      </button>
      <div className="book">
        <BookOpen />
      </div>
      <div className="task-copy">
        <div className="tags">
          <span className={`priority ${task.priority}`}>
            {priorityLabels[task.priority]}
          </span>
          <span className="subject">{task.subject}</span>
        </div>
        <h2>{task.title}</h2>
        {task.description ? <p>{task.description}</p> : null}
        {task.dependencyIds.length ? (
          <span className="dependency-count">
            <Link2 size={14} />
            {task.dependencyIds.length}{" "}
            {task.dependencyIds.length === 1 ? "dependencia" : "dependencias"}
          </span>
        ) : null}
      </div>
      <div className="task-meta">
        <span>
          <CalendarDays size={17} />
          {task.dueDate
            ? new Intl.DateTimeFormat("es-AR", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }).format(new Date(task.dueDate))
            : "Sin fecha límite"}
        </span>
        <span className={`status ${task.status}`}>
          {statusLabels[task.status]}
        </span>
        {task.urgency !== "none" ? (
          <small className={`warning ${task.urgency}`}>
            {urgencyLabels[task.urgency]}
          </small>
        ) : null}
        <div className="task-actions">
          <button
            type="button"
            aria-label={`Editar tarea ${task.title}`}
            className="icon-button"
            disabled={busy}
            onClick={onEdit}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label={`Gestionar tarea ${task.title}`}
            disabled={busy}
            onClick={onManage}
          >
            <Settings2 size={15} />
            Gestionar
          </button>
        </div>
      </div>
    </article>
  );
}
