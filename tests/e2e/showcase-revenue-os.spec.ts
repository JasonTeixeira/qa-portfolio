import { expect, test } from '@playwright/test'

test.describe('Revenue OS showcase prototype', () => {
  test('renders the prototype warehouse index', async ({ page }) => {
    await page.goto('/showcase')

    await expect(page.getByRole('heading', { name: /interactive systems/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /revenue os/i })).toBeVisible()
  })

  test('supports the guided revenue workflow', async ({ page }) => {
    await page.goto('/showcase/revenue-os')

    await expect(page.getByRole('heading', { name: /ai client acquisition command center/i })).toBeVisible()
    await expect(page.getByText('Live prototype')).toBeVisible()
    await expect(page.getByRole('heading', { name: /open and inspect the rev os prototype/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /open figma prototype/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /launch original figma build/i })).toBeVisible()
    await expect(page.getByText(/website-native version starts directly below/i)).toBeVisible()

    await page.getByRole('button', { name: /ironpeak roofing/i }).click()
    await expect(page.getByRole('heading', { name: /ironpeak roofing/i })).toBeVisible()
    await expect(page.getByText('Contractor Quote Engine', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: /generate private demo link/i }).click()
    await expect(page.getByRole('button', { name: /outreach/i })).toHaveClass(/stepActive/)

    await page.getByRole('button', { name: /approve packet/i }).click()
    await expect(page.getByText(/approved for controlled send/i)).toBeVisible()
    await expect(page.getByText(/classify reply and book discovery call/i)).toBeVisible()

    await expect(page.getByRole('link', { name: /build a packet for my business/i })).toBeVisible()
  })
})
