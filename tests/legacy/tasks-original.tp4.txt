import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../backend/src/app';
import { validateTask } from '../backend/src/services/task-service';
import { urgency } from '../frontend/src/utils/dates';
import type { Task } from '../shared/task';
const cleanup: (()=>void)[]=[];
afterEach(()=>{while(cleanup.length) cleanup.pop()!();});
function setup(){const context=createApp(':memory:');cleanup.push(()=>context.repository.close());return context.app;}
const valid={title:'Preparar informe de redes',subject:'Redes'};
describe('Reglas de creación',()=>{
  it('recorta texto y aplica valores iniciales',()=>expect(validateTask({...valid,title:'  Una tarea  '})).toMatchObject({title:'Una tarea',status:'pending',priority:'medium',isFavorite:false}));
  it.each(['ab',' '.repeat(5),'a'.repeat(61)])('rechaza título inválido %s',title=>expect(()=>validateTask({...valid,title})).toThrow());
  it.each([3,60])('acepta longitud límite %s',length=>expect(validateTask({...valid,title:'a'.repeat(length)}).title).toHaveLength(length));
  it.each([{subject:''},{subject:'  '},{subject:7},{status:'done'},{priority:'urgent'},{isFavorite:'yes'},{description:7},{dueDate:'2026-02-30'},{dueDate:'2026-01-01T12:00:00Z'},{id:'injected'},{createdAt:'injected'}, {unknown:true}])('rechaza valores o campos inválidos %j',override=>expect(()=>validateTask({...valid,...override})).toThrow());
  it('acepta una fecha bisiesta real',()=>expect(validateTask({...valid,dueDate:'2028-02-29'}).dueDate).toBe('2028-02-29'));
  it('distingue vencida, próxima y entregada',()=>{const task={dueDate:'2026-11-19',status:'pending'} as Task;const now=new Date(2026,10,16,12);expect(urgency(task,now)).toBe('soon');expect(urgency({...task,dueDate:'2026-11-15'},now)).toBe('overdue');expect(urgency({...task,status:'delivered'},now)).toBeUndefined();});
});
describe('API HTTP',()=>{
  it('crea con 201 y recupera con GET',async()=>{const app=setup();const created=await request(app).post('/api/tasks').send(valid).expect(201);expect(created.body.data.id).toMatch(/^[\da-f-]{36}$/);expect(created.headers.location).toBe(`/api/tasks/${created.body.data.id}`);const listed=await request(app).get('/api/tasks').expect(200);expect(listed.body.data).toEqual([created.body.data]);});
  it.each([{title:'ab',subject:'Redes'},{title:'Título válido',subject:''},{...valid,id:'fake'}])('valida en el servidor %j',async body=>{const app=setup();const result=await request(app).post('/api/tasks').send(body).expect(400);expect(result.body.error.code).toBe('VALIDATION_ERROR');expect((await request(app).get('/api/tasks')).body.data).toEqual([]);});
  it('controla JSON inválido y sigue atendiendo',async()=>{const app=setup();const result=await request(app).post('/api/tasks').set('Content-Type','application/json').send('{broken').expect(400);expect(result.body.error.code).toBe('INVALID_JSON');expect(JSON.stringify(result.body)).not.toContain('stack');await request(app).get('/api/tasks').expect(200);});
  it('rechaza otros formatos',async()=>{await request(setup()).post('/api/tasks').send('title=Una tarea').expect(415);});
  it('documenta rutas no implementadas con 404',async()=>{await request(setup()).patch('/api/tasks/123').send({status:'delivered'}).expect(404);});
  it('persiste después de cerrar y abrir SQLite',async()=>{const directory=mkdtempSync(join(tmpdir(),'techtask-'));cleanup.push(()=>rmSync(directory,{recursive:true,force:true}));const path=join(directory,'tasks.sqlite');const first=createApp(path);let id:string;try{id=(await request(first.app).post('/api/tasks').send(valid).expect(201)).body.data.id;}finally{first.repository.close();}const second=createApp(path);try{const response=await request(second.app).get('/api/tasks').expect(200);expect(response.body.data[0].id).toBe(id!);}finally{second.repository.close();}});
});
