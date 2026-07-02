import { test, expect } from '@playwright/test'

test.describe('US6: Comments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Alex Chen').click()
    await page.getByText('Mobile App Redesign').click()
    await page.locator('.task-card').first().click()
    await expect(page.locator('.task-detail')).toBeVisible()
  })

  test('can add a comment', async ({ page }) => {
    await page.fill('.comment-form textarea', 'This is a test comment')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    await expect(page.locator('.comment__body')).toContainText('This is a test comment')
  })

  test('comment shows author name and timestamp', async ({ page }) => {
    await page.fill('.comment-form textarea', 'Check author info')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    const comment = page.locator('.comment').last()
    await expect(comment.locator('.comment__author')).toContainText('Alex Chen')
    await expect(comment.locator('.comment__timestamp')).not.toBeEmpty()
  })

  test('own comment has Edit and Delete buttons', async ({ page }) => {
    await page.fill('.comment-form textarea', 'My comment')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    const comment = page.locator('.comment').last()
    await expect(comment.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(comment.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test("other user's comment has no Edit or Delete buttons", async ({ page }) => {
    await page.fill('.comment-form textarea', 'Alex comment')
    await page.getByRole('button', { name: 'Add Comment' }).click()

    // Close the task detail modal before navigating away
    await page.keyboard.press('Escape')
    await expect(page.locator('.modal-overlay')).not.toBeVisible()

    await page.getByText('Switch Profile').click()
    await expect(page.locator('.profile-selector')).toBeVisible()
    await page.getByText('Jordan Rivera').click()
    await expect(page.locator('.project-list-view')).toBeVisible()
    await page.getByText('Mobile App Redesign').click()
    await page.locator('.task-card').first().click()

    const alexComment = page.locator('.comment').first()
    await expect(alexComment.getByRole('button', { name: 'Edit' })).not.toBeVisible()
    await expect(alexComment.getByRole('button', { name: 'Delete' })).not.toBeVisible()
  })

  test('can edit own comment', async ({ page }) => {
    await page.fill('.comment-form textarea', 'Original text')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    const comment = page.locator('.comment').last()
    await comment.getByRole('button', { name: 'Edit' }).click()
    const textarea = comment.locator('textarea')
    await textarea.fill('Updated text')
    await comment.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('.comment__body').last()).toContainText('Updated text')
  })

  test('can delete own comment', async ({ page }) => {
    await page.fill('.comment-form textarea', 'To be deleted')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    const initialCount = await page.locator('.comment').count()
    const comment = page.locator('.comment').last()
    await comment.getByRole('button', { name: 'Delete' }).click()
    await expect(page.locator('.comment')).toHaveCount(initialCount - 1)
  })

  test('rejects empty comment', async ({ page }) => {
    await page.fill('.comment-form textarea', '   ')
    await page.getByRole('button', { name: 'Add Comment' }).click()
    await expect(page.locator('.comment-form .form-error')).not.toHaveAttribute('hidden')
  })
})
