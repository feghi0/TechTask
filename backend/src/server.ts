import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createApp } from './app';
const path=resolve(process.env.DATABASE_PATH ?? 'data/techtask.sqlite');
mkdirSync(dirname(path),{recursive:true});
const {app,repository}=createApp(path);
const server=app.listen(3001,'127.0.0.1',()=>console.log('TechTask API: http://127.0.0.1:3001'));
for(const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>server.close(()=>{repository.close();process.exit(0);}));
