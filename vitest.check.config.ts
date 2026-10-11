import { defineConfig } from 'vitest/config'

// Used only by `npm run check:content` and the monthly GitHub Action.
export default defineConfig({ test: { include: ['scripts/**/*.check.ts'], environment: 'node' } })
