/** Datos ficticios creados por la API dentro de la cuenta autenticada. */
import { pathToFileURL } from 'node:url';

export async function seedDemo(baseUrl: string, email: string, password: string) {
  let cookie = '';
  async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status} — ${result?.error?.message ?? 'Operación rechazada'}`);
    return result?.data as T;
  }
  await api('/api/auth/login', 'POST', { email, password });
  try {
    const project = await api<{ id: string }>('/api/projects', 'POST', { name: 'Proyecto de Redes — demostración', description: 'Datos ficticios para recorrer dependencias, entregas y progreso.' });
    type Revision = { id: string; version: number };
    let first = await api<Revision>(`/api/projects/${project.id}/tasks`, 'POST', { title: 'Diseñar la topología', subject: 'Redes', priority: 'high', description: 'Definir dispositivos y conexiones del laboratorio.' });
    let second = await api<Revision>(`/api/projects/${project.id}/tasks`, 'POST', { title: 'TP de Redes', subject: 'Redes', priority: 'high', isFavorite: true, description: 'Depende de completar el diseño de topología.' });
    second = await api<Revision>(`/api/tasks/${second.id}/dependencies`, 'POST', { version: second.version, dependencyId: first.id });
    first = await api<Revision>(`/api/tasks/${first.id}/status`, 'PATCH', { version: first.version, status: 'in_progress' });
    await api(`/api/projects/${project.id}/tasks`, 'POST', { title: 'Entrega de Programación', subject: 'Programación', priority: 'medium' });
    return { projectId: project.id, prerequisiteId: first.id, dependentId: second.id };
  } finally { await api('/api/auth/logout', 'POST', {}); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.env.TT_EMAIL || !process.env.TT_PASSWORD) throw new Error('Definí TT_EMAIL y TT_PASSWORD de una cuenta creada en la aplicación. No uses credenciales reales de otros servicios.');
  seedDemo(process.env.TT_BASE_URL ?? 'http://127.0.0.1:3001', process.env.TT_EMAIL, process.env.TT_PASSWORD)
    .then(result => console.log('Demostración creada en el proyecto:', result.projectId))
    .catch(error => { console.error(error instanceof Error ? error.message : 'No se pudo crear la demostración.'); process.exitCode = 1; });
}
