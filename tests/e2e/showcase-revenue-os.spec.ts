import { expect, test } from '@playwright/test'

test.describe('Revenue OS showcase prototype', () => {
  test('renders the prototype warehouse index', async ({ page }) => {
    await page.goto('/showcase')

    await expect(page.getByRole('heading', { name: /open the system before you buy the build/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /open revenue os/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /local services/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /view proof wall/i })).toBeVisible()
  })

  test('supports the guided revenue workflow', async ({ page }) => {
    await page.goto('/showcase/revenue-os')

    await expect(page.getByText(/turn leaking demand into/i).first()).toBeVisible()
    await expect(page.getByText(/booked calls/i).first()).toBeVisible()
    await expect(page.getByLabel(/revenue os visual lead flow/i)).toContainText(/website form/i)
    await expect(page.getByLabel(/revenue os visual lead flow/i)).toContainText(/revenue os/i)
    await expect(page.getByLabel(/revenue os visual lead flow/i)).toContainText(/booked calls/i)
    await expect(page.getByLabel(/revenue os example proof/i)).toContainText(/leads a day tracked/i)
    await expect(page.getByLabel(/revenue os example proof/i)).toContainText(/pipeline made visible/i)
    await expect(page.locator('iframe[title="Revenue OS Figma Make prototype"]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: /see the live demo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /open live demo/i })).toBeVisible()
    await expect(page.getByLabel(/revenue os demo guide/i)).toContainText(/open the lead queue/i)
    await expect(page.getByLabel(/revenue os demo guide/i)).toContainText(/check pipeline risk/i)
    await expect(page.getByLabel(/revenue os verified proof badges/i).getByText(/native react demo/i)).toBeVisible()
    await expect(page.getByLabel(/revenue os verified proof badges/i).getByText(/buyer-first story/i)).toBeVisible()
    await page.getByLabel(/live revenue os prototype/i).getByRole('button', { name: /focus mode/i }).click()
    await expect(page.getByRole('dialog', { name: /revenue os fullscreen prototype/i })).toBeVisible()
    await page.getByRole('button', { name: /exit focus/i }).click()
    await expect(page.getByRole('dialog', { name: /revenue os fullscreen prototype/i })).toHaveCount(0)
    await expect(page.getByLabel(/live revenue os prototype/i)).toContainText(/click queue, accounts, replies, analytics/i)
    await expect(page.getByText(/executive command center/i)).toBeVisible()
    await page.getByRole('button', { name: /lead queue/i }).first().click()
    await expect(page.getByText(/lead intelligence queue/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /book a revenue os walkthrough/i })).toBeVisible()
    await expect(page.getByLabel(/revenue os final call to action/i)).toContainText(/what we can build around your leads/i)
    await expect(page.getByLabel(/revenue os build scope/i)).toContainText(/lead source audit/i)
    await expect(page.getByLabel(/revenue os build scope/i)).toContainText(/pipeline reporting/i)
  })

  test('embeds usable product demos in the first warehouse prototypes', async ({ page }) => {
    const prototypes = [
      {
        path: '/showcase/contractor-quote-engine',
        heading: /turn quote traffic into booked walkthroughs/i,
        account: /quote command center/i,
      },
      {
        path: '/showcase/med-spa-consultation-funnel',
        heading: /turn treatment interest into booked consultations/i,
        account: /vela med spa/i,
      },
      {
        path: '/showcase/law-firm-intake-system',
        heading: /turn serious legal visitors into qualified consultations/i,
        account: /northline legal/i,
      },
      {
        path: '/showcase/ai-support-agent-dashboard',
        heading: /turn support volume into a controlled ai operations cockpit/i,
        account: /heliocart support/i,
      },
    ]

    for (const prototype of prototypes) {
      await page.goto(prototype.path)

      if (prototype.path === '/showcase/contractor-quote-engine') {
        await expect(page.getByText(/turn quote traffic into/i).first()).toBeVisible()
        await expect(page.getByText(/booked walkthroughs/i).first()).toBeVisible()
        await expect(page.getByText(prototype.account).first()).toBeVisible()
      } else {
        await expect(page.getByRole('heading', { name: prototype.heading })).toBeVisible()
        await expect(page.getByRole('heading', { name: prototype.account })).toBeVisible()
      }

      if (prototype.path === '/showcase/contractor-quote-engine') {
        await expect(page.getByLabel(/contractor quote routing visual/i)).toContainText(/storm search/i)
        await expect(page.getByLabel(/contractor quote routing visual/i)).toContainText(/booked walkthrough/i)
        await expect(page.getByLabel(/contractor quote engine live demo/i)).toContainText(/four clicks/i)
        await page.getByLabel(/live contractor quote prototype/i).getByRole('button', { name: /urgency high/i }).click()
        await expect(page.getByText(/water entering today/i)).toBeVisible()
        await page.getByLabel(/live contractor quote prototype/i).getByRole('button', { name: /book walkthrough/i }).click()
        await expect(page.getByText(/walkthrough confirmation sent/i)).toBeVisible()
        await page.getByLabel(/contractor quote engine live demo/i).getByRole('button', { name: /open live demo/i }).click()
        await expect(page.getByRole('dialog', { name: /contractor quote engine fullscreen prototype/i })).toBeVisible()
        await page.getByRole('button', { name: /exit focus/i }).click()
        await expect(page.getByRole('dialog', { name: /contractor quote engine fullscreen prototype/i })).toHaveCount(0)
        continue
      }

      await expect(page.getByRole('heading', { name: /open the version a prospect would understand/i })).toBeVisible()
      await expect(page.getByLabel(/decision demo/i)).toContainText(/Before/i)
      await expect(page.getByLabel(/decision demo/i)).toContainText(/Result/i)
      await page.getByLabel(/decision demo/i).getByRole('button', { name: /02/i }).click()
      await expect(page.getByLabel(/decision demo/i)).toContainText(/Buyer action/i)
      await page.getByLabel(/decision demo/i).getByRole('button', { name: /next step/i }).click()
      await expect(page.getByRole('link', { name: /build this for my business/i })).toHaveAttribute(
        'href',
        new RegExp(`/book\\?source=${prototype.path.replace('/showcase/', '')}_showcase`),
      )
      await expect(page.getByLabel(/verified proof status/i)).toContainText(/Route screenshot captured/i)
      await expect(page.getByLabel(/verified proof status/i)).toContainText(/Accessibility checked/i)

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
