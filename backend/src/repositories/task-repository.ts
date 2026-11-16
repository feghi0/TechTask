import { DatabaseSync } from 'node:sqlite';
import type { Task } from '../../../shared/task';
export class TaskRepository {
  private db: DatabaseSync;
  constructor(path: string) {
    this.db=new DatabaseSync(path);
    this.db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 3 AND 60),
      description TEXT, subject TEXT NOT NULL CHECK(length(trim(subject))>0),
      status TEXT NOT NULL CHECK(status IN ('pending','in_progress','blocked','delivered')),
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
      isFavorite INTEGER NOT NULL CHECK(isFavorite IN (0,1)), dueDate TEXT, createdAt TEXT NOT NULL
    )`);
  }
  insert(task: Task) {this.db.prepare('INSERT INTO tasks (id,title,description,subject,status,priority,isFavorite,dueDate,createdAt) VALUES (?,?,?,?,?,?,?,?,?)').run(task.id,task.title,task.description??null,task.subject,task.status,task.priority,Number(task.isFavorite),task.dueDate??null,task.createdAt);}
  list(): Task[] {return this.db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC, id').all().map(row=>({id:String(row.id),title:String(row.title),description:row.description===null?undefined:String(row.description),subject:String(row.subject),status:row.status as Task['status'],priority:row.priority as Task['priority'],isFavorite:row.isFavorite===1,dueDate:row.dueDate===null?undefined:String(row.dueDate),createdAt:String(row.createdAt)}));}
  close() {this.db.close();}
}
