import { useState, type FormEvent } from "react";
import type { Project } from "../../../shared/contracts";
import { Modal } from "./Modal";

export function ProjectForm({
  project,
  onSave,
  onClose,
  error = "",
}: {
  project?: Project;
  onSave: (name: string, description: string) => Promise<boolean>;
  onClose: () => void;
  error?: string;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      if (
        await onSave(String(data.get("name")), String(data.get("description")))
      )
        onClose();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={project ? "Editar proyecto" : "Nuevo proyecto"}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Nombre del proyecto
            <input
              name="name"
              required
              maxLength={160}
              defaultValue={project?.name}
              autoFocus
              placeholder="Ej. Proyecto de Base de Datos"
            />
          </label>
          <label>
            Descripción del proyecto
            <textarea
              name="description"
              rows={4}
              maxLength={8000}
              defaultValue={project?.description}
              placeholder="Qué querés lograr y qué necesitás entregar."
            />
          </label>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              {busy
                ? "Guardando…"
                : project
                  ? "Guardar proyecto"
                  : "Crear proyecto"}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
