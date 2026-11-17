import { useEffect, useState } from "react";
import { FolderOpen, Plus, ArrowUpRight } from "lucide-react";
import type { Project } from "../../../shared/contracts";
import { api, errorMessage } from "../services/api";
import { ProjectForm } from "./ProjectForm";

export function ProjectList({ onSelect }: { onSelect: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setProjects(await api.projects());
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <header>
        <div>
          <h1>Mis proyectos</h1>
          <p className="page-subtitle">Cada entrega empieza con un plan.</p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setError("");
            setForm(true);
          }}
        >
          <Plus size={19} />
          Nuevo proyecto
        </button>
      </header>
      {error && !form ? (
        <div className="error" role="alert">
          {error}
          <button type="button" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      ) : null}
      {loading ? (
        <p role="status">Cargando proyectos…</p>
      ) : projects.length ? (
        <section className="project-grid" aria-label="Proyectos">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-icon">
                <FolderOpen size={26} />
              </div>
              <h2>{project.name}</h2>
              <p>{project.description || "Sin descripción."}</p>
              <button
                className="project-open"
                aria-label={`Abrir proyecto ${project.name}`}
                onClick={() => onSelect(project.id)}
              >
                Abrir proyecto
                <ArrowUpRight size={19} />
              </button>
            </article>
          ))}
        </section>
      ) : !error ? (
        <section className="empty">
          <FolderOpen size={42} />
          <h2>Tu próximo proyecto empieza acá</h2>
          <p>Creá un proyecto para reunir sus tareas, fechas y dependencias.</p>
          <button className="primary" onClick={() => setForm(true)}>
            Crear mi primer proyecto
          </button>
        </section>
      ) : null}
      {form ? (
        <ProjectForm
          error={error}
          onClose={() => {
            setForm(false);
            setError("");
          }}
          onSave={async (name, description) => {
            setError("");
            try {
              const project = await api.createProject(name, description);
              setProjects((previous) => [project, ...previous]);
              return true;
            } catch (error) {
              setError(errorMessage(error));
              return false;
            }
          }}
        />
      ) : null}
    </>
  );
}
