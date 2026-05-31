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
  },
});
