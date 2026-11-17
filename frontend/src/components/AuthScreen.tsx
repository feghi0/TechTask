import { useState, type FormEvent } from "react";
import { GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import type { User } from "../../../shared/contracts";
import { api, errorMessage } from "../services/api";

export function AuthScreen({
  onAuthenticated,
  notice,
}: {
  onAuthenticated: (user: User) => void;
  notice: string;
}) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      onAuthenticated(
        await (register ? api.register : api.login)(
          String(fields.get("email")),
          String(fields.get("password")),
        ),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-shell">
      <section className="auth-intro">
        <div className="brand">
          <GraduationCap size={38} />
          <strong>TechTask</strong>
        </div>
        <div>
          <h1>
            Tus proyectos.
            <br />
            Un camino claro.
          </h1>
          <p>
            Organizá entregas, conectá tareas y avanzá con cada paso resuelto.
          </p>
          <div className="privacy-note">
            <ShieldCheck size={24} />
            <span>
              Tu cuenta, tus proyectos.
              <br />
              Un espacio privado para trabajar.
            </span>
          </div>
        </div>
        <span className="course-name">
          Generación T · Escuela Técnica N.º 35
        </span>
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <h2>{register ? "Creá tu cuenta" : "Volvé a tus proyectos"}</h2>
          <p>
            {register
              ? "Empezá a organizar tus entregas en un espacio propio."
              : "Ingresá para continuar donde lo dejaste."}
          </p>
          {notice ? (
            <p role="status" className="notice">
              {notice}
            </p>
          ) : null}
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <label>
                Correo electrónico
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  autoFocus
                />
              </label>
              <label>
                Contraseña
                <input
                  name="password"
                  type="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={register ? 12 : undefined}
                  maxLength={128}
                />
              </label>
              {register ? (
                <small>
                  Usá entre 12 y 128 caracteres. No reutilices contraseñas de
                  otros servicios.
                </small>
              ) : null}
              {error ? (
                <p className="error" role="alert">
                  {error}
                </p>
              ) : null}
              <button className="primary full-width" type="submit">
                {busy ? "Conectando…" : register ? "Registrarme" : "Ingresar"}
                <ArrowRight size={18} />
              </button>
            </fieldset>
          </form>
          <button
            className="text-button auth-switch"
            type="button"
            disabled={busy}
            onClick={() => {
              setRegister((value) => !value);
              setError("");
            }}
          >
            {register ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
          <small className="auth-footnote">
            No ingreses datos sensibles en las tareas. No hay recuperación de
            contraseña por correo en esta versión.
          </small>
        </div>
      </main>
    </div>
  );
}
