import { randomUUID } from 'node:crypto';
import { statuses, priorities, type Task } from '../../../shared/task';
import { AppError } from '../middleware/errors';
import type { TaskRepository } from '../repositories/task-repository';
export function validateTask(input: unknown): Omit<Task,'id'|'createdAt'> {
  const fields: Record<string,string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AppError(400,'VALIDATION_ERROR','Se esperaba un objeto JSON.');
  const body = input as Record<string,unknown>;
  const allowed = ['title','description','subject','status','priority','isFavorite','dueDate'];
  for (const key of Object.keys(body)) if (!allowed.includes(key)) fields[key]='Campo no permitido.';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  if (title.length < 3 || title.length > 60) fields.title='Debe tener entre 3 y 60 caracteres.';
  if (!subject) fields.subject='La materia es obligatoria.';
  if (body.description !== undefined && typeof body.description !== 'string') fields.description='Debe ser texto.';
  const status = body.status === undefined ? 'pending' : body.status;
  const priority = body.priority === undefined ? 'medium' : body.priority;
  if (!statuses.some(value=>value===status)) fields.status='Estado no permitido.';
  if (!priorities.some(value=>value===priority)) fields.priority='Prioridad no permitida.';
  if (body.isFavorite !== undefined && typeof body.isFavorite !== 'boolean') fields.isFavorite='Debe ser booleano.';
  if (body.dueDate !== undefined) {
    const date = body.dueDate;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) fields.dueDate='Debe ser una fecha válida YYYY-MM-DD.';
  }
  if (Object.keys(fields).length) throw new AppError(400,'VALIDATION_ERROR','Los datos enviados no son válidos.',fields);
  return {title,subject,description:body.description as string|undefined,status:status as Task['status'],priority:priority as Task['priority'],isFavorite:body.isFavorite as boolean|undefined ?? false,dueDate:body.dueDate as string|undefined};
}
export class TaskService {
  constructor(private repository: TaskRepository) {}
  list() {return this.repository.list();}
  create(body: unknown) {const task: Task={...validateTask(body),id:randomUUID(),createdAt:new Date().toISOString()}; this.repository.insert(task);return task;}
}
