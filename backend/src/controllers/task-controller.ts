import type { RequestHandler } from 'express';
import type { TaskService } from '../services/task-service';
export class TaskController {
  constructor(private service: TaskService) {}
  list: RequestHandler = (_req,res)=>{res.json({data:this.service.list()});};
  create: RequestHandler = (req,res)=>{
    const task=this.service.create(req.body as unknown);
    res.location(`/api/tasks/${task.id}`).status(201).json({data:task});
  };
}
