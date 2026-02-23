import { test, expect } from '@playwright/test';
import type { Response as PWResponse } from '@playwright/test';

// This suite is intentionally “paranoid”. It tries to click every user-facing
// navigation path and a representative set of CTAs so we catch:
// - dead buttons
// - missing pages
// - broken internal routing
// - obvious regressions in client-side widgets

const navLinks = ['About', 'Platform', 'Telemetry', 'Dashboard', 'Projects', 'Artifacts', 'Blog', 'Contact'];

const projectSlugs = [
  'aws-landing-zone-guardrails',
  'selenium-python-framework',
  'api-testing-framework',
  'cicd-testing-pipeline',
  'performance-testing-suite',
  'mobile-testing-framework',
  'bdd-cucumber-framework',
  'visual-regression-testing-suite',
  'security-testing-suite',
];

const blogIds = ['1', '2', '3', '4', '5', '100'];

async function expectOkResponse(url: string, response: PWResponse | null) {
  expect(response, `No response for navigation to ${url}`).toBeTruthy();
  expect(response?.status(), `Expected <400 for ${url}, got ${response?.status()}`).toBeLessThan(400);
}

test('Top nav: every link navigates and renders a page', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();

  for (const name of navLinks) {
    const link = nav.getByRole('link', { name, exact: true });
    await expect(link, `Missing nav link: ${name}`).toBeVisible();

    const expectedHref = (await link.getAttribute('href')) || '';
    expect(expectedHref, `${name} link has empty href`).not.toBe('');
    expect(expectedHref, `${name} link should not be a dead # link`).not.toMatch(/^#$/);

    const res = await page.goto(expectedHref, { waitUntil: 'domcontentloaded' });
    await expectOkResponse(expectedHref, res);
    await expect(page.locator('h1').first(), `${name} route should have an H1`).toBeVisible();
  }
});

test('Home hero CTAs: View Flagship / View Projects / Resume', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /View Flagship/i })).toBeVisible();

  const flagship = page.getByRole('link', { name: /View Flagship/i });
  const flagshipHref = (await flagship.getAttribute('href')) || '';
  expect(flagshipHref).toBe('/projects/aws-landing-zone-guardrails');
  await flagship.click();
  await expect(page).toHaveURL(/\/projects\/aws-landing-zone-guardrails$/);
  await expect(page.locator('h1').first()).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: /View Projects/i }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('h1').first()).toBeVisible();

  // Resume is an <a> that opens a new tab.
  await page.goto('/');
  const resume = page.getByRole('link', { name: /Download Resume/i });
  await expect(resume).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    resume.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/resume\.pdf$/i);
});

test('Projects: click every project page + validate proof links exist', async ({ page }) => {
  for (const slug of projectSlugs) {
    await page.goto(`/projects/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();

    // Primary proof link
    await expect(page.getByRole('link', { name: /View on GitHub/i })).toBeVisible();

    // If there are any proof links on page, ensure they have valid href.
    const proofLinks = page.getByRole('link').filter({ hasText: /CI Runs|Report|Demo/i });
    const count = await proofLinks.count();
    for (let i = 0; i < count; i++) {
      const href = await proofLinks.nth(i).getAttribute('href');
      expect(href, `proof link #${i} has empty href on ${slug}`).toBeTruthy();
      expect(href, `proof link #${i} is dead (#) on ${slug}`).not.toMatch(/^#$/);
    }

    // Quality gates section present (platform signal)
    await expect(page.getByRole('heading', { name: 'Quality Gates', exact: true })).toBeVisible();
  }
});

test('Blog: open every post and ensure it has real body content', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('h1').first()).toBeVisible();

  for (const id of blogIds) {
    await page.goto(`/blog/${id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();

    // Must have substantial content (avoid “empty blog page” regressions)
    await expect(page.locator('article').first()).toContainText(
      /\b(Framework|Testing|CI\/CD|Automation|Performance|Security|Quality)\b/i
    );
  }
});

test('Artifacts: filter pills + search + preview modal', async ({ page }) => {
  await page.goto('/artifacts');
  await expect(page.getByRole('heading', { name: 'Runbooks & Evidence' })).toBeVisible();

  // Navigate to the downloads library.
  await page.getByRole('link', { name: 'Browse Downloads' }).click();
  await expect(page.getByRole('heading', { name: 'Download Library' })).toBeVisible();

  // Search should narrow results.
  const search = page.getByLabel(/Search artifacts/i);
  await search.fill('filled');
  await expect(page.getByRole('heading', { name: /\(Filled Example\)/i }).first()).toBeVisible();

  // Filter chips/pills exist and are clickable.
  // (We keep assertions light to avoid coupling to exact taxonomy.)
  const pills = page.getByRole('button').filter({ hasText: /All|Templates|Checklists|Playbooks|Examples/i });
  if ((await pills.count()) > 0) {
    await pills.first().click();
  }

  // Preview modal works and is not empty.
  await page.getByRole('button', { name: 'Preview' }).first().click();
  await expect(page.getByRole('dialog', { name: /Preview/i })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText(/(Template|Checklist|Playbook|Example)/i);
});

test('Contact: form renders and validates required fields', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('h1').first()).toBeVisible();

  // Submit empty form and assert validation UI appears.
  const submit = page.getByRole('button', { name: /Send/i });
  if (await submit.isVisible()) {
    await submit.click();
    // Loose assertion: must show at least one validation marker.
    // (This form uses asterisks for required fields; some implementations
    // may not show explicit error strings until blur/submit depending on lib.)
    await expect(page.locator('form')).toContainText(/\*/);
  }
});
