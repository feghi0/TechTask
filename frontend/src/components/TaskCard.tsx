import { BookOpen, CalendarDays, Star } from 'lucide-react';
import type { Task } from '../../../shared/task';
import { urgency, statusLabels, priorityLabels } from '../utils/dates';
export function TaskCard({task}:{task:Task}) {
  const warning=urgency(task);
  return <article className="task-card"><Star size={20} aria-label={task.isFavorite?'Favorita':'Sin marcar como favorita'} className={task.isFavorite?'favorite':''}/><div className="book"><BookOpen/></div><div className="task-copy"><div className="tags"><span className={`priority ${task.priority}`}>{priorityLabels[task.priority]}</span><span className="subject">{task.subject}</span></div><h2>{task.title}</h2>{task.description?<p>{task.description}</p>:null}</div><div className="task-meta"><span><CalendarDays size={17}/>{task.dueDate?new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(task.dueDate)):'Sin fecha límite'}</span><span className={`status ${task.status}`}>{statusLabels[task.status]}</span>{warning?<small className="warning">{warning==='overdue'?'Vencida':'Próxima a vencer'}</small>:null}</div></article>;
}
