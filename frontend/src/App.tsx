import { useEffect, useState } from "react";
import { GraduationCap, FolderOpen, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "../../shared/contracts";
import { api, ApiError, errorMessage } from "./services/api";
import { AuthScreen } from "./components/AuthScreen";
import { ProjectList } from "./components/ProjectList";
import { ProjectWorkspace } from "./components/ProjectWorkspace";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectId, setProjectId] = useState<string | null>(() => {
    const candidate = new URLSearchParams(window.location.hash.slice(1)).get(
      "project",
    );
    return candidate && /^[\da-f-]{36}$/i.test(candidate) ? candidate : null;
  });
  const [loggingOut, setLoggingOut] = useState(false);
  function selectProject(id: string | null) {
    setProjectId(id);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${id ? `#project=${id}` : ""}`,
    );
  }
  async function restore() {
    setLoading(true);
    setError("");
    try {
      setUser(await api.me());
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401))
        setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void restore();
    const expired = () => {
      setUser(null);
      selectProject(null);
      setNotice("Tu sesión terminó. Ingresá nuevamente.");
    };
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      await api.logout();
      setUser(null);
      selectProject(null);
      setNotice("Sesión cerrada.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  }
  if (loading)
    return (
      <div className="boot-state" role="status">
        <GraduationCap size={40} />
        <p>Abriendo TechTask…</p>
      </div>
    );
  if (!user)
    return error ? (
      <div className="boot-state">
        <h1>No pudimos conectar</h1>
        <p role="alert">{error}</p>
        <button className="primary" onClick={() => void restore()}>
          Reintentar
        </button>
      </div>
    ) : (
      <AuthScreen
        notice={notice}
        onAuthenticated={(authenticated) => {
          setUser(authenticated);
          setNotice("");
          selectProject(null);
        }}
      />
    );
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Principal">
        <div className="brand">
          <GraduationCap size={32} />
          <strong>TechTask</strong>
        </div>
        <button className="nav-projects" onClick={() => selectProject(null)}>
          <FolderOpen size={20} />
          Mis proyectos
        </button>
        <div className="account">
          <ShieldCheck size={17} />
          <span title={user.email}>{user.email}</span>
        </div>
        <button
          className="logout"
          onClick={() => void logout()}
          disabled={loggingOut}
        >
          <LogOut size={17} />
          {loggingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
        <span className="course">Generación T</span>
      </nav>
      <main id="content">
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {projectId ? (
          <ProjectWorkspace
            key={projectId}
            projectId={projectId}
            onBack={() => selectProject(null)}
          />
        ) : (
          <ProjectList onSelect={selectProject} />
        )}
      </main>
    </div>
  );
}
