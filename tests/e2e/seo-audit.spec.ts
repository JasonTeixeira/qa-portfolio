import { expect, test, type Page } from '@playwright/test';

const mockReport = {
  url: 'https://example.com/',
  checks: {
    title: {
      pass: true,
      weight: 15,
      label: 'Page title',
      detail: '"Example Domain" (14 chars — ideal range is 15-65)',
    },
    metaDescription: {
      pass: false,
      weight: 12,
      label: 'Meta description',
      detail: 'No meta description found',
    },
    canonical: {
      pass: false,
      weight: 8,
      label: 'Canonical tag',
      detail: 'No canonical tag found',
    },
    openGraph: {
      pass: true,
      weight: 10,
      label: 'Open Graph tags',
      detail: 'og:title is "Example Domain"',
    },
    structuredData: {
      pass: false,
      weight: 12,
      label: 'Structured data (JSON-LD)',
      detail: 'No application/ld+json found',
    },
  },
  performance: {
    score: 91,
    lcpMs: 1260,
    cls: 0.01,
  },
};

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
}

async function mockSuccessfulAudit(page: Page) {
  await page.route('**/api/tools/seo-audit', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ score: 82, report: mockReport }),
    });
  });
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe('SEO audit tool', () => {
  test('renders the premium audit funnel and submits successfully', async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    await mockSuccessfulAudit(page);

    await page.goto('/tools/seo-audit');

    await expect(
      page.getByRole('heading', { level: 1, name: /find the leaks/i }),
    ).toBeVisible();
    await expect(page.getByTestId('seo-audit-form')).toBeVisible();
    await expect(page.getByText('What gets checked')).toBeVisible();

    await page.getByLabel(/url to audit/i).fill('https://example.com/');
    await page.getByRole('textbox', { name: /email/i }).fill('e2e-test@sageideas.dev');
    await page.getByTestId('seo-audit-submit').click();

    const report = page.getByTestId('seo-audit-report');
    await expect(report).toBeVisible();
    await expect(report).toContainText('82');
    await expect(report).toContainText('Priority fixes');
    await expect(report).toContainText('Passing');
    await expect(report.getByRole('link', { name: /fix these issues/i })).toHaveAttribute(
      'href',
      '/book?context=seo-audit',
    );

    await assertNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test('shows a clear error for blocked private URLs', async ({ page }) => {
    await page.route('**/api/tools/seo-audit', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Private network URLs are blocked.' }),
      });
    });

    await page.goto('/tools/seo-audit');
    await page.getByLabel(/url to audit/i).fill('http://192.168.0.1/');
    await page.getByRole('textbox', { name: /email/i }).fill('e2e-test@sageideas.dev');
    await page.getByTestId('seo-audit-submit').click();

    await expect(page.locator('[role="alert"]:not([aria-live])')).toContainText(
      'Private network URLs are blocked.',
    );
  });

  test('stays usable without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockSuccessfulAudit(page);

    await page.goto('/tools/seo-audit');
    await assertNoHorizontalOverflow(page);

    await page.getByLabel(/url to audit/i).fill('https://example.com/');
    await page.getByRole('textbox', { name: /email/i }).fill('e2e-test@sageideas.dev');
    await page.getByTestId('seo-audit-submit').click();

    await expect(page.getByTestId('seo-audit-report')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
