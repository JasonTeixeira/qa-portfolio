import { expect, test } from '@playwright/test'

async function openCommercialHome(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('sage_living_os_boot_seen', 'true')
    window.localStorage.setItem('sage-intent', 'hire')
  })
  await page.goto('/?intent=hire&source=e2e')
}

test.describe('business homepage', () => {
  test('presents buyer-first routes and openable systems', async ({ page }) => {
    await openCommercialHome(page)

    await expect(page.getByRole('heading', { name: /turn traffic into booked calls/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /see live systems/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /interactive systems you can actually click/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /open revenue os/i })).toHaveAttribute('href', '/showcase/revenue-os')
    await expect(page.getByRole('link', { name: /open quote engine/i })).toHaveAttribute('href', '/showcase/contractor-quote-engine')

    for (const route of [
      'Get more leads',
      'Qualify quote requests',
      'Automate intake',
      'Launch AI support',
      'Improve website conversion',
    ]) {
      await expect(page.getByRole('heading', { name: route })).toBeVisible()
    }
  })

  test('mobile homepage does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openCommercialHome(page)

    const metrics = await page.evaluate(() => {
      const heading = document.querySelector<HTMLElement>('#hero-heading')
      const rect = heading?.getBoundingClientRect()
      return {
        innerWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        headingRight: rect?.right ?? 0,
        headingLeft: rect?.left ?? 0,
      }
    })

    expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1)
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1)
    expect(metrics.headingLeft).toBeGreaterThanOrEqual(0)
    expect(metrics.headingRight).toBeLessThanOrEqual(metrics.innerWidth + 1)
  })

  test('business funnel routes use buyer-first positioning', async ({ page }) => {
    const routes = [
      { path: '/services', text: /pick the leak\. build the system/i },
      { path: '/pricing', text: /know the route before you pay/i },
      { path: '/book?source=revenue_os_showcase', text: /build the version/i },
      { path: '/contact', text: /tell me what you want built/i },
      { path: '/trust', text: /what gets tested before you buy/i },
      { path: '/showcase', text: /open the system before you buy the build/i },
      { path: '/work', text: /open the systems behind the work/i },
      { path: '/founder', text: /turns a business leak into a working system/i },
      { path: '/industries', text: /find the system closest to your market/i },
      { path: '/process', text: /from business leak to working system/i },
      { path: '/how-it-works', text: /see the system before you buy the build/i },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await expect(page.getByText(route.text).first()).toBeVisible()
    }

    await page.goto('/book?source=revenue_os_showcase')
    await expect(page.getByRole('link', { name: /pick a walkthrough time/i })).toBeVisible()
    await expect(page.getByText(/forms, replies, missed calls/i)).toBeVisible()
  })

  test('tier two business routes keep source-aware booking paths', async ({ page }) => {
    const routes = [
      { path: '/work', link: /book the build call/i, href: '/book?source=work' },
      { path: '/founder', link: /book the build call/i, href: '/book?source=founder' },
      { path: '/industries', link: /book the build call/i, href: '/book?source=industries' },
      { path: '/process', link: /book the build call/i, href: '/book?source=process' },
      { path: '/how-it-works', link: /book the build call/i, href: '/book?source=how-it-works' },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await expect(page.locator(`a[href="${route.href}"]`).first()).toBeVisible()
    }
  })
})
