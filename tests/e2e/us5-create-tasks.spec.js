import { test, expect } from '@playwright/test'

test.describe('US5: Create and Assign Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Alex Chen').click()
    await page.getByText('Mobile App Redesign').click()
  })

  test('creates a task with title only in To Do column', async ({ page }) => {
    await page.getByText('+ Add Task').click()
    await page.fill('input#task-title-input', 'New test task')
    await page.getByRole('button', { name: 'Create Task' }).click()
    await expect(page.locator('[data-column="todo"]')).toContainText('New test task')
  })

  test('new task shows Unassigned when no assignee selected', async ({ page }) => {
    await page.getByText('+ Add Task').click()
    await page.fill('input#task-title-input', 'Unassigned task')
    await page.getByRole('button', { name: 'Create Task' }).click()
    const todoColumn = page.locator('[data-column="todo"]')
    await expect(todoColumn).toContainText('Unassigned')
  })

  test('rejects empty task title', async ({ page }) => {
    await page.getByText('+ Add Task').click()
    const submitBtn = page.getByRole('button', { name: 'Create Task' })
    await expect(submitBtn).toBeDisabled()
  })

  test('task assigned to active user has highlight class', async ({ page }) => {
    await page.getByText('+ Add Task').click()
    await page.fill('input#task-title-input', 'My own task')
    await page.locator('select#task-assignee-select').selectOption({ label: 'Alex Chen' })
    await page.getByRole('button', { name: 'Create Task' }).click()
    const newCard = page.locator('[data-column="todo"] .task-card').last()
    await expect(newCard).toHaveClass(/task-card--mine/)
  })
})
