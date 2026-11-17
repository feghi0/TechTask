// Recibe DATABASE_URL por stdin, sin escribirla en argumentos, disco o salida.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdout.write('Listo para conexión PostgreSQL por stdin (entrada oculta).\n');
let input = '';
process.stdin.on('data', chunk => {
  input += chunk;
  if (!/[\r\n]/.test(input)) return;
  process.stdin.removeAllListeners('data');
  const connection = input.trim();
  input = '';
  if (!/^postgres(?:ql)?:\/\//.test(connection)) throw new Error('Formato de conexión inválido.');
  if (new URL(connection).pathname !== '/techtask_test') throw new Error('Solo se permiten pruebas en la base aislada techtask_test; producción está prohibida.');
  const child = spawn(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'tests/tasks.test.ts', 'tests/calendar.test.ts'], {env: {...process.env, TEST_DATABASE_URL: connection},stdio:['ignore','pipe','pipe']});
  let output = '';
  const consume = data => {const safe=data.toString().split(connection).join('[REDACTED]').replace(/postgres(?:ql)?:\/\/\S+/g,'[REDACTED]'); output+=safe;process.stdout.write(safe);};
  child.stdout.on('data',consume);child.stderr.on('data',consume);
  child.on('exit', code => {mkdirSync('docs/evidencias',{recursive:true});writeFileSync('docs/evidencias/tests-postgresql-remoto.txt',output);process.exit(code??1);});
});
