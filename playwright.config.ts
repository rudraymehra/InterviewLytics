import { defineConfig } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001'

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  retries: 0,
  workers: 1, // flows share seeded demo accounts — run serially
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    permissions: [], // deny camera/mic so getUserMedia fails fast and the UI falls back
  },
  reporter: [['list']],
})
