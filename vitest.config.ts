import { defineConfig } from 'vitest/config';
export default defineConfig({test:{include:['tests/tasks.test.ts'],environment:'node'}});
