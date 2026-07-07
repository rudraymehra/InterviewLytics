import { test, expect, Page } from '@playwright/test'

/**
 * UI smoke tests. Prereqs: dev server running (E2E_BASE_URL, default :3001),
 * database migrated + `npm run seed` (demo accounts below).
 */
const RECRUITER = { email: 'recruiter@demo.test', password: 'Demo1234' }
const CANDIDATE = { email: 'candidate@demo.test', password: 'Demo1234' }

async function login(page: Page, portal: 'recruiter' | 'candidate', creds: { email: string; password: string }) {
  await page.goto(`/login-${portal}`)
  await page.getByPlaceholder(/email/i).fill(creds.email)
  await page.getByPlaceholder(/password/i).fill(creds.password)
  await page.getByRole('button', { name: /sign in|log ?in/i }).click()
  await page.waitForURL(`**/${portal}/dashboard`, { timeout: 20_000 })
}

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText(/interview/i)
})

test('orphan routes redirect', async ({ page }) => {
  await page.goto('/login')
  await page.waitForURL('**/login-candidate')
  await page.goto('/dashboard')
  await page.waitForURL('**/login-candidate')
})

test('recruiter: login, dashboard, jobs list with counts', async ({ page }) => {
  await login(page, 'recruiter', RECRUITER)
  await expect(page.locator('body')).toContainText(/active jobs|applicants/i)

  await page.goto('/recruiter/jobs')
  await expect(page.locator('body')).toContainText('Senior Frontend Engineer', { timeout: 15_000 })
})

test('recruiter: create and delete a job', async ({ page }) => {
  await login(page, 'recruiter', RECRUITER)
  await page.goto('/recruiter/jobs')
  await page.getByRole('button', { name: /post|create|new job/i }).first().click()

  const title = `Smoke Test Role ${Date.now()}`
  await page.getByPlaceholder(/senior frontend developer/i).fill(title)
  const company = page.getByPlaceholder(/company|acme/i).first()
  if (await company.isVisible().catch(() => false)) await company.fill('Smoke Co')
  await page.getByPlaceholder(/describe the role/i).fill('A role created by the UI smoke test to verify job CRUD works.')
  await page.getByPlaceholder(/list required skills/i).fill('TypeScript, React, testing')
  await page.getByRole('button', { name: /post job|create job|save/i }).last().click()

  await expect(page.locator('body')).toContainText(title, { timeout: 15_000 })

  // delete it again — scope the Delete button to the card we just created
  page.on('dialog', (d) => d.accept()) // native window.confirm
  const card = page
    .locator('div')
    .filter({ hasText: title })
    .filter({ has: page.getByRole('button', { name: /^delete$/i }) })
    .last()
  await card.getByRole('button', { name: /^delete$/i }).click()
  await expect(page.locator('body')).not.toContainText(title, { timeout: 15_000 })
})

test('candidate: login, browse jobs, applications page', async ({ page }) => {
  await login(page, 'candidate', CANDIDATE)
  await page.goto('/candidate/jobs')
  await expect(page.locator('body')).toContainText('Senior Frontend Engineer', { timeout: 15_000 })

  await page.goto('/candidate/applications')
  await expect(page.locator('body')).toContainText(/application/i)
})

test('candidate: interview page shows guidance without params', async ({ page }) => {
  await login(page, 'candidate', CANDIDATE)
  await page.goto('/candidate/interview')
  // With no applicationId the page should not crash — expect redirect or guidance
  await expect(page.locator('body')).not.toContainText(/unhandled|application error/i)
})

test('recruiter: applicants page loads with filters', async ({ page }) => {
  await login(page, 'recruiter', RECRUITER)
  await page.goto('/recruiter/applicants')
  await expect(page.locator('body')).toContainText(/applicant/i, { timeout: 15_000 })
})

test('recruiter: analytics renders', async ({ page }) => {
  await login(page, 'recruiter', RECRUITER)
  await page.goto('/recruiter/analytics')
  await expect(page.locator('body')).toContainText(/candidates|match|pass rate/i, { timeout: 15_000 })
})
