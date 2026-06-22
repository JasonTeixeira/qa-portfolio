import { expect, test } from '@playwright/test'

test.describe('Revenue OS showcase prototype', () => {
  test('renders the prototype warehouse index', async ({ page }) => {
    await page.goto('/showcase')

    await expect(page.getByRole('heading', { name: /interactive systems/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /revenue os/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /local services/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /view proof wall/i })).toBeVisible()
  })

  test('supports the guided revenue workflow', async ({ page }) => {
    await page.goto('/showcase/revenue-os')

    await expect(page.getByRole('heading', { name: /ai client acquisition command center/i })).toBeVisible()
    await expect(page.getByText('Live prototype')).toBeVisible()
    await expect(page.getByRole('heading', { name: /open and inspect the rev os prototype/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /open figma prototype/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /launch original figma build/i })).toBeVisible()
    await expect(page.getByText(/on-site rev os prototype above is the embedded demo/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /the product demo is built directly/i })).toBeVisible()

    await page.getByRole('button', { name: /ironpeak roofing/i }).click()
    await expect(page.getByRole('heading', { name: /ironpeak roofing/i })).toBeVisible()
    await expect(page.getByText('Contractor Quote Engine', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: /generate private demo link/i }).click()
    await expect(page.getByRole('button', { name: /outreach/i })).toHaveClass(/stepActive/)

    await page.getByRole('button', { name: /approve packet/i }).click()
    await expect(page.getByText(/approved for controlled send/i)).toBeVisible()
    await expect(page.getByText(/send the approved packet/i)).toBeVisible()

    await page.getByRole('button', { name: /send approved packet/i }).click()
    await expect(page.getByText(/packet sent and tracked/i)).toBeVisible()
    await expect(page.getByText(/watch reply intent/i)).toBeVisible()

    await expect(page.getByRole('link', { name: /build a packet for my business/i })).toBeVisible()
  })

  test('embeds usable product demos in the first warehouse prototypes', async ({ page }) => {
    const prototypes = [
      {
        path: '/showcase/contractor-quote-engine',
        heading: /quote funnel for service businesses/i,
        account: /ironpeak roofing/i,
      },
      {
        path: '/showcase/med-spa-consultation-funnel',
        heading: /premium consultation path/i,
        account: /vela med spa/i,
      },
      {
        path: '/showcase/law-firm-intake-system',
        heading: /consultation funnel for serious service firms/i,
        account: /northline legal/i,
      },
      {
        path: '/showcase/ai-support-agent-dashboard',
        heading: /ai support cockpit/i,
        account: /heliocart support/i,
      },
    ]

    for (const prototype of prototypes) {
      await page.goto(prototype.path)

      await expect(page.getByRole('heading', { name: prototype.heading })).toBeVisible()
      await expect(page.getByRole('heading', { name: /you can click through/i })).toBeVisible()
      await expect(page.getByRole('heading', { name: prototype.account })).toBeVisible()

      await page.getByRole('button', { name: /approve packet/i }).click()
      await expect(page.getByRole('button', { name: /packet approved/i })).toBeVisible()

      await page.getByRole('button', { name: /send handoff/i }).click()
      await expect(page.getByText(/live handoff sent/i)).toBeVisible()
    }
  })

  test('covers the required showcase operating routes', async ({ page }) => {
    const routes = [
      { path: '/showcase/private/revenue-os', text: /private demo packet/i },
      { path: '/showcase/private/revenue-os/preview', text: /internal packet preview/i },
      { path: '/showcase/admin', text: /admin proof board/i },
      { path: '/showcase/admin/revenue-os', text: /proof and gap report/i },
      { path: '/showcase/compare', text: /compare prototype packages/i },
      { path: '/showcase/proof', text: /public proof wall/i },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await expect(page.getByText(route.text)).toBeVisible()
    }

    await page.goto('/showcase/admin')
    await expect(page.getByRole('link', { name: /preview/i }).first()).toBeVisible()
    await expect(page.getByText(/axe violations/i)).toBeVisible()

    await page.goto('/showcase/proof')
    await expect(page.getByText(/what is not proven yet/i)).toBeVisible()
    await expect(page.getByText(/deployed preview qa is not captured/i)).toBeVisible()
  })
})
