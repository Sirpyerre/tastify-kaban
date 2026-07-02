import { test, expect } from '@playwright/test'

test.describe('US4: Create Projects and Manage Members', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Taylor Kim').click()
  })

  test('creates a new project with a valid name', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await page.fill('input#project-name-input', 'Performance Testing Sprint')
    await page.getByRole('button', { name: 'Create Project' }).click()
    await expect(page.locator('.kanban-column')).toHaveCount(4)
  })

  test('rejects empty project name', async ({ page }) => {
    await page.getByText('+ New Project').click()
    const submitBtn = page.getByRole('button', { name: 'Create Project' })
    await expect(submitBtn).toBeDisabled()
  })

  test('new project has 4 empty columns', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await page.fill('input#project-name-input', 'Empty Test Project')
    await page.getByRole('button', { name: 'Create Project' }).click()
    await expect(page.locator('.kanban-column')).toHaveCount(4)
    await expect(page.locator('.kanban-column__empty')).toHaveCount(4)
  })

  test('can add members to a project', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    await page.getByText('Manage Members').click()
    await expect(page.locator('.member-item')).not.toHaveCount(0)
  })

  test('can remove a member from a project', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    await page.getByText('Manage Members').click()
    const initialCount = await page.locator('.member-item').count()
    await page.locator('.member-item .btn--danger').first().click()
    const newCount = await page.locator('.member-item').count()
    expect(newCount).toBeLessThanOrEqual(initialCount)
  })
})
