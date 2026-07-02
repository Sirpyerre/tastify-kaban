import { test, expect } from '@playwright/test'

test.describe('US2: View Project List and Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Alex Chen').click()
  })

  test('shows all 3 sample projects', async ({ page }) => {
    await expect(page.getByText('Mobile App Redesign')).toBeVisible()
    await expect(page.getByText('API Integration Sprint')).toBeVisible()
    await expect(page.getByText('Q3 Platform Release')).toBeVisible()
  })

  test('opens kanban board with 4 columns in correct order', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    const columns = page.locator('.kanban-column')
    await expect(columns).toHaveCount(4)
    await expect(columns.nth(0)).toContainText('To Do')
    await expect(columns.nth(1)).toContainText('In Progress')
    await expect(columns.nth(2)).toContainText('In Review')
    await expect(columns.nth(3)).toContainText('Done')
  })

  test('task cards are visible with title and assignee', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    await expect(page.locator('.task-card').first()).toBeVisible()
    await expect(page.locator('.task-card__title').first()).not.toBeEmpty()
  })

  test('tasks assigned to active user have highlight class', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Jordan Rivera').click()
    await page.getByText('Mobile App Redesign').click()
    const mineCards = page.locator('.task-card--mine')
    await expect(mineCards).toHaveCount(2)
  })

  test('tasks assigned to other users do not have highlight class', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    await expect(page.locator('.task-card').first()).toBeVisible()
    const total = await page.locator('.task-card').count()
    const mine = await page.locator('.task-card--mine').count()
    expect(mine).toBeLessThan(total)
  })

  test('back button returns to project list', async ({ page }) => {
    await page.getByText('Mobile App Redesign').click()
    await page.getByText('← Projects').click()
    await expect(page).toHaveURL(/#\/projects/)
  })
})
