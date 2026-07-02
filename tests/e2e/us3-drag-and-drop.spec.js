import { test, expect } from '@playwright/test'

test.describe('US3: Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Alex Chen').click()
    await page.getByText('Mobile App Redesign').click()
    await expect(page.locator('.kanban-column')).toHaveCount(4)
  })

  test('task can be moved from one column to another', async ({ page }) => {
    const todoColumn = page.locator('[data-column="todo"]')
    const inProgressColumn = page.locator('[data-column="in_progress"]')

    const todoCard = todoColumn.locator('.task-card').first()
    const cardTitle = await todoCard.locator('.task-card__title').textContent()

    const sourceBox = await todoCard.boundingBox()
    const targetBox = await inProgressColumn.boundingBox()

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
    await page.mouse.up()

    await expect(inProgressColumn).toContainText(cardTitle)
  })

  test('column count badge updates after move', async ({ page }) => {
    const todoColumn = page.locator('[data-column="todo"]')
    const doneColumn = page.locator('[data-column="done"]')

    const initialTodoCount = await todoColumn.locator('.kanban-column__count').textContent()
    const initialDoneCount = await doneColumn.locator('.kanban-column__count').textContent()

    const todoCard = todoColumn.locator('.task-card').first()
    const sourceBox = await todoCard.boundingBox()
    const targetBox = await doneColumn.boundingBox()

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
    await page.mouse.up()

    const newTodoCount = await todoColumn.locator('.kanban-column__count').textContent()
    const newDoneCount = await doneColumn.locator('.kanban-column__count').textContent()

    expect(parseInt(newTodoCount)).toBe(parseInt(initialTodoCount) - 1)
    expect(parseInt(newDoneCount)).toBe(parseInt(initialDoneCount) + 1)
  })
})
