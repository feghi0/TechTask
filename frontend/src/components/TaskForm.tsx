import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import type { Task, TaskInput } from "../../../shared/contracts";

export function TaskForm({
  task,
  onSave,
  onClose,
  error,
}: {
  task?: Task;
  onSave: (input: TaskInput) => Promise<boolean>;
  onClose: () => void;
  error: string;
}) {
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const ok = await onSave({
        title: String(data.get("title")),
        subject: String(data.get("subject")),
        description: String(data.get("description")),
        priority: String(data.get("priority")) as TaskInput["priority"],
        isFavorite: data.get("favorite") === "on",
        dueDate: data.get("dueDate") ? String(data.get("dueDate")) : null,
      });
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <aside
      className="form-panel"
      aria-label={task ? "Editar tarea" : "Nueva tarea"}
    >
      <h2>{task ? "Editar tarea" : "Nueva tarea"}</h2>
      <p className="form-intro">
        {task
          ? "Actualizá los detalles de esta entrega."
          : "Cada tarea nueva empieza pendiente."}
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={saving}>
          <label>
            Título *
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={task?.title}
              placeholder="Ej. TP de Redes"
              autoFocus
            />
            <small>Entre 3 y 60 caracteres.</small>
          </label>
          <label>
            Descripción
            <textarea
              name="description"
              rows={4}
              maxLength={20000}
              defaultValue={task?.description}
              placeholder="Instrucciones o detalles relevantes…"
            />
          </label>
          <label>
            Materia *
            <input
              name="subject"
              required
              maxLength={200}
              defaultValue={task?.subject}
              placeholder="Ej. Redes"
            />
          </label>
          <label>
            Prioridad
            <select name="priority" defaultValue={task?.priority ?? "medium"}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>
          <label>
            Fecha de entrega
            <input
              name="dueDate"
              type="date"
              defaultValue={task?.dueDate ?? ""}
            />
          </label>
          <label className="check">
            <input
              name="favorite"
              type="checkbox"
              defaultChecked={task?.isFavorite}
            />
            Marcar como favorita
          </label>
          {error ? (
            <p role="alert" className="error">
              {error}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary" type="submit">
              <Save size={17} />
              {saving ? "Guardando…" : "Guardar tarea"}
            </button>
          </div>
          <small>* Campos obligatorios. La fecha es opcional.</small>
        </fieldset>
      </form>
    </aside>
  );
}
