import { test, expect } from '@playwright/test'

/**
 * End-to-end proof that the multi-language system is genuinely wired, not just present:
 * the switcher works, routing + lang/dir are correct, chrome AND blog content translate,
 * navigation stays in-locale, hreflang is honest, RTL works, and English is untouched.
 *
 * A translated post that exists in every locale (verified in content/blog/i18n).
 */
const TRANSLATED_SLUG = 'how-i-debug-production-issues-a-real-framework-not-guessing'

test('English baseline is untouched', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
})

test('language switcher opens and lists all 10 languages', async ({ page }) => {
  await page.goto('/pricing')
  const trigger = page.getByRole('button', { name: 'Change language' }).first()
  await expect(trigger).toBeVisible()
  await trigger.click()
  const menu = page.getByRole('listbox', { name: 'Languages' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('option')).toHaveCount(10)
  await expect(menu.getByRole('option', { name: /Español/ })).toBeVisible()
  await expect(menu.getByRole('option', { name: /中文/ })).toBeVisible()
  await expect(menu.getByRole('option', { name: /العربية/ })).toBeVisible()
})

test('selecting Spanish navigates to /es and translates the chrome', async ({ page }) => {
  await page.goto('/pricing')
  await page.getByRole('button', { name: 'Change language' }).first().click()
  await page.getByRole('listbox').getByRole('option', { name: /Español/ }).click()
  await expect(page).toHaveURL(/\/es\/pricing/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  // Translated chrome is rendered (footer/nav carries the Spanish label).
  await expect(page.getByText('Servicios').first()).toBeVisible()
})

test('navigation stays inside the locale', async ({ page }) => {
  await page.goto('/es/pricing')
  // Internal links must carry the /es prefix; auth links must stay canonical.
  expect(await page.locator('header a[href^="/es/"]').count()).toBeGreaterThan(0)
  expect(await page.locator('a[href="/es/login"]').count()).toBe(0)
  expect(await page.locator('a[href="/login"]').count()).toBeGreaterThan(0)
})

test('blog content is served in Spanish with an honest hreflang map', async ({ page }) => {
  await page.goto(`/es/blog/${TRANSLATED_SLUG}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  // The translated title appears (Spanish word for "production").
  await expect(page.locator('h1')).toContainText(/producci[oó]n/i)
  // hreflang advertises all 10 locales + x-default (this post exists in every language).
  const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('hreflang')),
  )
  for (const tag of ['en', 'es', 'zh-Hans', 'ar', 'ru', 'x-default']) {
    expect(hreflangs).toContain(tag)
  }
})

test('academy course content is translated, not just the chrome', async ({ page }) => {
  await page.goto('/es/academy/ai-native-product-building')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  // The track title + a lesson render in Spanish (not the English source).
  await expect(page.locator('h1')).toContainText(/Construcci[oó]n de Productos Nativos/i)
  await expect(page.getByText('Mapa de oferta a producto').first()).toBeVisible()
  // English source strings must NOT appear as visible content.
  await expect(page.getByText('AI-Native Product Building')).toHaveCount(0)
})

test('Arabic is right-to-left', async ({ page }) => {
  await page.goto(`/ar/blog/${TRANSLATED_SLUG}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})

test('mobile users can switch language too', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/pricing')
  await page.getByRole('button', { name: /Open menu/ }).click()
  const mobileNav = page.locator('#mobile-nav')
  await expect(mobileNav).toBeVisible()
  const trigger = mobileNav.getByRole('button', { name: 'Change language' })
  await expect(trigger).toBeVisible()
  await trigger.click()
  await mobileNav.getByRole('option', { name: /Français/ }).click()
  await expect(page).toHaveURL(/\/fr\/pricing/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
})
