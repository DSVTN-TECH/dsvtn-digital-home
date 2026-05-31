import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3100)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 375, height: 740 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'laptop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_DATA_SOURCE: 'mock',
    },
  },
})
