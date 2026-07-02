import { test, expect } from '@playwright/test'

test.describe('US1: Profile Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows all 5 predefined profiles on launch', async ({ page }) => {
    await expect(page.locator('.profile-card')).toHaveCount(5)
  })

  test('displays correct name and role for each user', async ({ page }) => {
    await expect(page.getByText('Alex Chen')).toBeVisible()
    await expect(page.getByText('Jordan Rivera')).toBeVisible()
    await expect(page.getByText('Sam Park')).toBeVisible()
    await expect(page.getByText('Taylor Kim')).toBeVisible()
    await expect(page.getByText('Morgan Lee')).toBeVisible()
  })

  test('selecting a profile navigates to project list', async ({ page }) => {
    await page.locator('.profile-card').first().click()
    await expect(page).toHaveURL(/#\/projects/)
  })

  test('selected user name is visible in the header after selection', async ({ page }) => {
    await page.getByText('Alex Chen').click()
    await expect(page.locator('.app-header')).toContainText('Alex Chen')
  })

  test('profile can be switched via the header control', async ({ page }) => {
    await page.getByText('Alex Chen').click()
    await page.getByText('Switch Profile').click()
    await expect(page.locator('.profile-card')).toHaveCount(5)
  })

  test('profile selector is not shown on project list route after selection', async ({ page }) => {
    await page.getByText('Jordan Rivera').click()
    await expect(page.locator('.profile-selector')).not.toBeVisible()
  })

  test('profile cards are keyboard accessible', async ({ page }) => {
    const firstCard = page.locator('.profile-card').first()
    await firstCard.focus()
    await firstCard.press('Enter')
    await expect(page).toHaveURL(/#\/projects/)
  })
})
