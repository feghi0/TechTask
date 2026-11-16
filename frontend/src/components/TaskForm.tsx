import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import type { CreateTask } from '../../../shared/task';
export function TaskForm({onCreate,onClose}:{onCreate:(task:CreateTask)=>Promise<void>;onClose:()=>void}) {
  const [saving,setSaving]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget;const data=new FormData(form);
    setSaving(true);setError('');
    try {await onCreate({title:String(data.get('title')),subject:String(data.get('subject')),description:String(data.get('description')),priority:String(data.get('priority')) as CreateTask['priority'],isFavorite:data.get('favorite')==='on',...(data.get('dueDate')?{dueDate:String(data.get('dueDate'))}:{})});form.reset();}catch(error){setError(error instanceof Error?error.message:'No se pudo guardar.');}finally{setSaving(false);}
  }
  return <aside className="form-panel"><h2>Nueva tarea</h2><form onSubmit={submit}><fieldset disabled={saving}><label>Título *<input name="title" required minLength={3} maxLength={60} placeholder="Ej. Informe de redes" autoFocus/></label><label>Descripción<textarea name="description" rows={4} placeholder="Instrucciones o detalles relevantes…"/></label><label>Materia *<input name="subject" required placeholder="Ej. Redes"/></label><label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label><label>Fecha de entrega<input name="dueDate" type="date"/></label><label className="check"><input name="favorite" type="checkbox"/> Marcar como favorita</label>{error?<p role="alert" className="error">{error}</p>:null}<div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit"><Save size={17}/>{saving?'Guardando…':'Guardar tarea'}</button></div><small>* Campos obligatorios. La fecha es opcional.</small></fieldset></form></aside>;
}
