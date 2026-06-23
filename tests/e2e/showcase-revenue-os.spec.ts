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

    await expect(page.getByRole('heading', { name: /send a buyer a preview/i })).toBeVisible()
    await expect(page.getByText('Example packet')).toBeVisible()
    await expect(page.getByRole('heading', { name: /private sales asset they can actually click/i })).toBeVisible()
    await expect(page.locator('iframe[title="Revenue OS Figma Make prototype"]')).toHaveCount(0)
    await expect(page.getByLabel(/revenue os verified proof badges/i).getByText(/private url/i)).toBeVisible()
    await expect(page.getByLabel(/revenue os verified proof badges/i).getByText(/working prototype/i)).toBeVisible()
    await expect(page.getByLabel(/sample private prototype packet/i)).toContainText(/turn paid clicks into booked consults/i)
    await expect(page.getByLabel(/prototype packet prospect examples/i)).toContainText(/ironpeak roofing/i)
    await expect(page.getByLabel(/prototype packet prospect examples/i)).toContainText(/northline legal/i)
    await expect(page.getByLabel(/cold email versus private prototype packet/i)).toContainText(/make the buyer feel seen/i)
    await expect(page.getByText(/generic cold email/i)).toBeVisible()
    await expect(page.getByLabel(/cold email versus private prototype packet/i)).toContainText(/private prototype packet/i)
    await expect(page.getByText(/customize this sample/i)).toBeVisible()
    await page.getByText(/swap in the buyer/i).click()
    await page.getByLabel(/private outbound personalization controls/i).getByLabel(/business/i).fill('Nova Dental')
    await page.getByLabel(/private outbound personalization controls/i).getByLabel(/current leak/i).fill('Visitors cannot find the AI consultation offer')
    await page.getByLabel(/private outbound personalization controls/i).getByLabel(/desired outcome/i).fill('Convert AI interest into booked consults')
    await expect(page.getByText(/nova dental revenue os concept/i)).toBeVisible()
    await expect(page.getByLabel(/live private packet preview/i)).toContainText('/showcase/private/nova-dental')
    await expect(page.getByLabel(/live private packet preview/i)).toContainText(/visitors cannot find the ai consultation offer/i)
    await expect(page.getByLabel(/live private packet preview/i)).toContainText(/convert ai interest into booked consults/i)
    await page.getByRole('button', { name: /open live demo/i }).click()
    await expect(page.getByRole('dialog', { name: /revenue os fullscreen prototype/i })).toBeVisible()
    await page.getByRole('button', { name: /exit focus/i }).click()
    await expect(page.getByRole('dialog', { name: /revenue os fullscreen prototype/i })).toHaveCount(0)
    await expect(page.getByText(/open the full working demo/i)).toBeVisible()
    await page.getByText(/view the interactive rev os prototype/i).click()
    await expect(page.getByText(/executive command center/i)).toBeVisible()
    await page.getByRole('button', { name: /lead queue/i }).first().click()
    await expect(page.getByText(/lead intelligence queue/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /open the system layer/i })).toBeVisible()
    await page.getByText(/show the engine only when the buyer wants/i).click()

    await page.getByLabel(/revenue os main opportunity queue/i).getByRole('button', { name: /ironpeak roofing/i }).click()
    await expect(page.getByLabel(/revenue os main selected account/i).getByRole('heading', { name: /ironpeak roofing/i })).toBeVisible()
    await expect(page.getByLabel(/revenue os main selected account/i).getByText('Contractor Quote Engine', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: /generate private demo link/i }).click()
    await expect(page.getByLabel(/revenue sprint workflow/i).getByRole('button', { name: /outreach/i })).toHaveClass(/stepActive/)

    await page.getByRole('button', { name: /approve packet/i }).click()
    await expect(page.getByLabel(/revenue os main selected account/i).getByText(/approved for controlled send/i)).toBeVisible()
    await expect(page.getByLabel(/revenue os main selected account/i).getByRole('button', { name: /send approved packet/i })).toBeVisible()

    await page.getByRole('button', { name: /send approved packet/i }).click()
    await expect(page.getByLabel(/revenue os main selected account/i).getByText(/packet sent and tracked/i)).toBeVisible()
    await expect(page.getByText(/watch reply intent/i)).toBeVisible()

    await expect(page.getByRole('link', { name: /book the build call/i })).toBeVisible()
    await expect(page.getByLabel(/private prototype packet deliverables/i)).toContainText(/one private packet/i)
    await expect(page.getByLabel(/private prototype packet deliverables/i)).toContainText(/private concept page/i)
    await expect(page.getByLabel(/private prototype packet deliverables/i)).toContainText(/short outbound note/i)
    await expect(page.getByLabel(/private prototype packet deliverables/i)).toContainText(/build path/i)
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
