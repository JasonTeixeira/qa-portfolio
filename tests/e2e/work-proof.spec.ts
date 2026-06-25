import { expect, test } from '@playwright/test'

test.describe('Work and case-study proof funnel', () => {
  test('work index presents buyer-facing proof routes', async ({ page }) => {
    await page.goto('/work')

    await expect(page.getByRole('heading', { name: /see the proof before the pitch/i })).toBeVisible()
    await expect(page.getByLabel(/work proof map/i)).toContainText(/case → demo → call/i)
    await expect(page.getByRole('link', { name: /book the build call/i }).first()).toHaveAttribute(
      'href',
      '/book?source=work_hero',
    )
    await expect(page.getByRole('heading', { name: /choose the proof closest to your business/i })).toBeVisible()
    await expect(page.getByLabel(/filter case studies by category/i).getByRole('tab', { name: 'Product' })).toBeVisible()
    await expect(page.getByRole('link', { name: /open proof/i }).first()).toHaveAttribute('href', /\/work\//)
    await expect(page.getByRole('link', { name: /build around this/i }).first()).toHaveAttribute(
      'href',
      /\/book\?source=work_/,
    )
  })

  test('case-study detail leads with buyer transformation before technical proof', async ({ page }) => {
    await page.goto('/work/nexural')

    await expect(page.getByRole('heading', { name: /a trading platform built like an institution/i })).toBeVisible()
    await expect(page.getByLabel(/buyer proof bridge/i)).toContainText(/Before/i)
    await expect(page.getByLabel(/buyer proof bridge/i)).toContainText(/System/i)
    await expect(page.getByLabel(/buyer proof bridge/i)).toContainText(/Result/i)
    await expect(page.getByRole('link', { name: /map my version/i })).toHaveAttribute(
      'href',
      '/book?source=work_nexural',
    )
    await expect(page.getByText(/185 tables/i).first()).toBeVisible()
    await expect(page.getByText(/proof board/i).first()).toBeVisible()
    await expect(page.getByText(/measured, not asserted/i).first()).toBeVisible()
  })

  test('work and case-study pages do not overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 })

    for (const path of ['/work', '/work/nexural']) {
      await page.goto(path)
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }))
      expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1)
      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1)
    }
  })
})
