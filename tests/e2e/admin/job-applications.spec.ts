import { test, expect } from '../../fixtures/auth';

test.describe('Admin Job Application OS', () => {
  test('shows phases 1-6 programs queue packets workflow and safety posture', async ({ adminPage }) => {
    await adminPage.goto('/admin/job-applications');

    await expect(adminPage.getByTestId('job-application-os-dashboard')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: 'Premium application pipeline' })).toBeVisible();
    await expect(adminPage.getByTestId('job-os-phase-scorecard')).toContainText('1 Foundation');
    await expect(adminPage.getByTestId('job-os-phase-scorecard')).toContainText('12 Scale proof');
    await expect(adminPage.getByTestId('job-os-programs')).toContainText('Candidate profile database');
    await expect(adminPage.getByTestId('job-os-programs')).toContainText('Submission proof capture');
    await expect(adminPage.getByTestId('job-os-programs')).toContainText('Load and staging proof');
    await expect(adminPage.getByTestId('job-os-daily-queue')).toContainText('Junior AI Application Engineer');
    await expect(adminPage.getByTestId('job-os-candidate-intelligence')).toContainText('Next.js and React');
    await expect(adminPage.getByTestId('job-os-packets')).toContainText('Application packets');
    await expect(adminPage.getByTestId('job-os-recruiter-loop')).toContainText('Recruiter loop');
    await expect(adminPage.getByTestId('job-os-interview-os')).toContainText('Interview OS');
    await expect(adminPage.getByTestId('job-os-analytics-ops')).toContainText('Live source proof');
    await expect(adminPage.getByTestId('job-os-live-hardening')).toContainText('Readiness audit');
    await expect(adminPage.getByTestId('job-os-live-hardening')).toContainText('Resume artifacts');
    await expect(adminPage.getByTestId('job-os-live-capture')).toContainText('LinkedIn/browser capture');
    await expect(adminPage.getByTestId('job-os-live-capture')).toContainText('Gmail stream status');
    await expect(adminPage.getByTestId('job-os-optimization-engine')).toContainText('Dataset import center');
    await expect(adminPage.getByTestId('job-os-optimization-engine')).toContainText('Strategy engine');
    await expect(adminPage.getByTestId('job-os-observability-load')).toContainText('Load proof');
    await expect(adminPage.getByTestId('job-os-workflow')).toContainText('ready');
    await expect(adminPage.getByTestId('job-os-safety')).toContainText('manual-only');
  });
});
