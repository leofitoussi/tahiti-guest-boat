import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'sanity:client': resolve(__dirname, 'test/__mocks__/sanity-client.ts'),
    },
  },
  test: {
    // Prevent concurrent builds from writing to dist/ simultaneously
    fileParallelism: false,
    // Exclude nested git worktrees (e.g. .claude/worktrees/*) so their own
    // copies of the test suite aren't picked up alongside the main one.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.claude/worktrees/**'],
  },
});
