import type { Request, RequestHandler, Response } from "express";
import type { User } from "../../../shared/contracts";
import type { TaskService } from "../services/task-service";
const owner = (res: Response) => (res.locals.user as User).id;
const id = (req: Request, name = "id") => String(req.params[name]);
export class TaskController {
  constructor(private service: TaskService) {}
  projects: RequestHandler = async (_req, res) => {
    res.json({ data: await this.service.projects(owner(res)) });
  };
  createProject: RequestHandler = async (req, res) => {
    const project = await this.service.createProject(
      owner(res),
      req.body as unknown,
    );
    res
      .location(`/api/projects/${project.id}`)
      .status(201)
      .json({ data: project });
  };
  project: RequestHandler = async (req, res) => {
    res.json({ data: await this.service.projectDetail(owner(res), id(req)) });
  };
  updateProject: RequestHandler = async (req, res) => {
    res.json({
      data: await this.service.updateProject(
        owner(res),
        id(req),
        req.body as unknown,
      ),
    });
  };
  deleteProject: RequestHandler = async (req, res) => {
    await this.service.deleteProject(owner(res), id(req), req.body as unknown);
    res.sendStatus(204);
  };
  progress: RequestHandler = async (req, res) => {
    res.json({
      data: (await this.service.projectDetail(owner(res), id(req))).progress,
    });
  };
  list: RequestHandler = async (_req, res) => {
    res.json({ data: await this.service.list(owner(res)) });
  };
  projectTasks: RequestHandler = async (req, res) => {
    res.json({ data: await this.service.list(owner(res), id(req)) });
  };
  create: RequestHandler = async (req, res) => {
    const task = await this.service.create(
      owner(res),
      id(req),
      req.body as unknown,
    );
    res.location(`/api/tasks/${task.id}`).status(201).json({ data: task });
  };
  get: RequestHandler = async (req, res) => {
    res.json({ data: await this.service.get(owner(res), id(req)) });
  };
  update: RequestHandler = async (req, res) => {
    res.json({
      data: await this.service.update(owner(res), id(req), req.body as unknown),
    });
  };
  delete: RequestHandler = async (req, res) => {
    await this.service.delete(owner(res), id(req), req.body as unknown);
    res.sendStatus(204);
  };
  status: RequestHandler = async (req, res) => {
    res.json({
      data: await this.service.status(owner(res), id(req), req.body as unknown),
    });
  };
  addDependency: RequestHandler = async (req, res) => {
    res.json({
      data: await this.service.addDependency(
        owner(res),
        id(req),
        req.body as unknown,
      ),
    });
  };
  removeDependency: RequestHandler = async (req, res) => {
    res.json({
      data: await this.service.removeDependency(
        owner(res),
        id(req),
        id(req, "dependencyId"),
        req.body as unknown,
      ),
    });
  };
  history: RequestHandler = async (req, res) => {
    res.json({ data: await this.service.history(owner(res), id(req)) });
  };
}
