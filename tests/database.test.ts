import { expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { connectDatabase } from '../backend/src/database/db';
it('inicia en una carpeta anidada inexistente como un checkout limpio de CI', async () => {
  const temp = mkdtempSync(join(tmpdir(),'techtask-clean-'));
  const directory = join(temp,'data','nested','postgres');
  let db: Awaited<ReturnType<typeof connectDatabase>> | undefined;
  try {
    expect(existsSync(directory)).toBe(false);
    db = await connectDatabase({dataDir:directory});
    await db.query('CREATE TABLE smoke (value INTEGER NOT NULL)');
    await db.query('INSERT INTO smoke VALUES (42)');
    await db.close(); db = undefined;
    db = await connectDatabase({dataDir:directory});
    expect((await db.query('SELECT value FROM smoke')).rows).toEqual([{value:42}]);
  } finally {await db?.close();rmSync(temp,{recursive:true,force:true});}
},60000);
