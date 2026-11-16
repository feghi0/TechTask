import express from 'express';
import { TaskRepository } from './repositories/task-repository';
import { TaskService } from './services/task-service';
import { TaskController } from './controllers/task-controller';
import { AppError, errorHandler } from './middleware/errors';
export function createApp(path: string) {
  const repository=new TaskRepository(path);
  const controller=new TaskController(new TaskService(repository));
  const app=express();
  app.disable('x-powered-by');
  app.use(express.json({limit:'32kb'}));
  app.get('/api/tasks',controller.list);
  app.post('/api/tasks',(req,_res,next)=>{if(!req.is('application/json')) return next(new AppError(415,'UNSUPPORTED_MEDIA_TYPE','Se requiere application/json.'));next();},controller.create);
  app.use((_req,_res,next)=>next(new AppError(404,'NOT_FOUND','Ruta no disponible.')));
  app.use(errorHandler);
  return {app,repository};
}
