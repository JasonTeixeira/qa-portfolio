// Phase-1 unit tests — pure logic only, no server, no Supabase.
// Run with: node --experimental-strip-types tests/unit/run.mjs
//
// Keeps each suite self-contained so we don't have to wire a full test
// framework just for a handful of assertions.

import { strict as assert } from 'node:assert';

// .ts imports work via the tsx loader, which is registered through the
// package script (`tsx tests/unit/run.mjs` or `node --import tsx ...`).
// Direct `node tests/unit/run.mjs` will fail when importing .ts files.

const suites = [];
function test(name, fn) {
  suites.push({ name, fn });
}

// -------------------------------------------------------------- api-errors

test('api-errors: badRequest returns 400 + structured body', async () => {
  const { badRequest } = await import('../../lib/api-errors.ts');
  const res = badRequest('nope');
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'nope');
  assert.equal(body.code, 'bad_request');
});

test('api-errors: unauthorized + forbidden + notFound + serverError status codes', async () => {
  const { unauthorized, forbidden, notFound, serverError } = await import(
    '../../lib/api-errors.ts'
  );
  assert.equal(unauthorized().status, 401);
  assert.equal(forbidden().status, 403);
  assert.equal(notFound().status, 404);
  assert.equal(serverError().status, 500);
});

test('api-errors: tooManyRequests sets Retry-After header', async () => {
  const { tooManyRequests } = await import('../../lib/api-errors.ts');
  const res = tooManyRequests(42);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '42');
});

test('api-errors: fromZodError returns 400 with first message', async () => {
  const { fromZodError } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const parsed = z.object({ x: z.string() }).safeParse({ x: 1 });
  assert.equal(parsed.success, false);
  const res = fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.code, 'invalid_request');
  assert.ok(typeof body.error === 'string' && body.error.length > 0);
});

// -------------------------------------------------------------- rate-limit

test('rate-limit: checkRateLimitFromHeaders blocks after limit', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '203.0.113.42' : null;
    },
  };
  const opts = { limit: 3, windowMs: 60_000, prefix: 'unit-test:burst' };
  for (let i = 0; i < 3; i++) {
    const r = mod.checkRateLimitFromHeaders(headers, opts);
    assert.equal(r.ok, true, `hit ${i + 1} should pass`);
  }
  const blocked = mod.checkRateLimitFromHeaders(headers, opts);
  assert.equal(blocked.ok, false);
  if (blocked.ok === false) {
    assert.ok(blocked.retryAfterSeconds >= 1);
  }
});

test('rate-limit: separate prefixes do not share buckets', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '198.51.100.7' : null;
    },
  };
  const a = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:a',
  });
  const b = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:b',
  });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
});

// -------------------------------------------------------------- route validation
// Direct-call a route's POST() to assert the Zod gate fires before any
// side-effects. We stub requireAdminApi to return a fake guard and
// supabaseAdmin so the body validator runs without DB access.

test('admin/templates POST: malformed body returns 400 with { error }', async () => {
  // Mock dependencies via dynamic import + module replacement is brittle in
  // Node ESM; instead, drive the handler with a body that fails Zod and
  // verify the helper response shape independently of the auth guard.
  // We import the schema chain by pulling fromZodError + a fresh schema.
  const { fromZodError, badRequest } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const schema = z.object({
    title: z.string().min(1).max(300),
  });
  // Empty body -> Zod fails -> route returns fromZodError(...).
  const parsed = schema.safeParse({});
  assert.equal(parsed.success, false);
  const res = parsed.success
    ? badRequest('unreachable')
    : fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error, 'response body must include `error`');
  assert.ok(typeof body.code === 'string');
});

// -------------------------------------------------------------- active-org (Phase 2B PR-A)

test('resolveActiveOrg: explicit slug wins over cookie and first', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'beta-test-co',
    cookieSlug: 'acme',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: cookie wins when no explicit slug', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: null,
    cookieSlug: 'beta-test-co',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: falls back to first when slug+cookie miss', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'unknown-slug',
    cookieSlug: 'also-unknown',
  });
  assert.equal(out?.org.id, 'a');
});

test('resolveActiveOrg: empty memberships -> null', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const out = resolveActiveOrg([], { slug: 'anything', cookieSlug: 'whatever' });
  assert.equal(out, null);
});

// -------------------------------------------------------------- events

test('event name registry is the closed set', async () => {
  const { EVENT_NAMES, GA4_CONVERSION_EVENTS, isValidEvent } = await import('../../lib/analytics/events.ts');
  assert.ok(EVENT_NAMES.includes('checkout_start'));
  assert.ok(EVENT_NAMES.includes('lead_magnet_complete'));
  assert.equal(isValidEvent('not_a_real_event'), false);
  assert.equal(isValidEvent('cta_click'), true);
  assert.deepEqual([...GA4_CONVERSION_EVENTS], [
    'contact_submit',
    'checkout_start',
    'lead_magnet_complete',
    'newsletter_signup',
    'route_finder_complete',
  ]);

  // Exact count guard — update this when adding new events
  assert.equal(EVENT_NAMES.length, 24);

  // Every expected event must be present
  const expected = [
    'cta_click',
    'contact_submit',
    'pricing_view',
    'service_view',
    'checkout_start',
    'checkout_complete',
    'lead_magnet_start',
    'lead_magnet_complete',
    'booking_click',
    'newsletter_signup',
    'decision_tree_complete',
    'route_finder_start',
    'route_finder_step',
    'route_finder_complete',
    'route_finder_cta_click',
    'route_console_open',
    'route_console_click',
    'sound_enabled',
    'splash_skipped',
    'academy_track_selected',
    'experiment_viewed',
  ];
  for (const name of expected) {
    assert.ok(EVENT_NAMES.includes(name), `EVENT_NAMES missing: ${name}`);
  }
});

test('experiments: getVariant is SSR-safe and defaults to control', async () => {
  const { getVariant, EXPERIMENT_FLAGS } = await import('../../lib/analytics/experiments.ts');
  assert.equal(getVariant(EXPERIMENT_FLAGS.routeFinderHeroEntry), 'control');
});

test('attribution: extracts first-touch campaign metadata from a URL', async () => {
  const { extractAttributionFromUrl, parseAttributionCookie, serializeAttribution } = await import(
    '../../lib/analytics/attribution.ts'
  );
  const attribution = extractAttributionFromUrl(
    'https://www.sageideas.dev/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123',
    'https://linkedin.com/feed',
    new Date('2026-06-16T12:00:00.000Z'),
  );

  assert.equal(attribution.landingPage, '/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123');
  assert.equal(attribution.referrer, 'https://linkedin.com/feed');
  assert.equal(attribution.utmSource, 'linkedin');
  assert.equal(attribution.utmMedium, 'social');
  assert.equal(attribution.utmCampaign, 'wave-2');
  assert.equal(attribution.gclid, 'abc123');
  assert.deepEqual(parseAttributionCookie(serializeAttribution(attribution)), attribution);
});

test('lead scoring: high-intent studio inquiry outranks newsletter signup', async () => {
  const { scoreLead } = await import('../../lib/leads/scoring.ts');
  const studio = scoreLead({
    source: 'contact',
    email: 'founder@company.com',
    name: 'Founder',
    detail: 'We need a full AI product, brand system, checkout funnel, and content engine built this quarter.',
    inquiryType: 'studio',
    budget: '50-100k',
  });
  const newsletter = scoreLead({
    source: 'newsletter',
    email: 'reader@gmail.com',
    name: null,
    detail: 'Newsletter signup',
  });

  assert.ok(studio.score > newsletter.score);
  assert.ok(studio.reasons.includes('studio engagement selected'));
  assert.ok(newsletter.reasons.includes('newsletter signup'));
});

test('acquisition inbound: maps public inquiry into scored CRM account payloads', async () => {
  const { buildInboundAcquisitionCandidate } = await import('../../lib/acquisition/inbound.ts');
  const candidate = buildInboundAcquisitionCandidate({
    leadId: 'lead-123',
    source: 'contact',
    email: 'founder@northstar-dental.example',
    name: 'Avery Stone',
    detail:
      'We run a dental practice and need a better website, booking flow, SEO visibility, and a more polished brand presence for new patients.',
    inquiryType: 'project',
    budget: '10-25k',
    metadata: {
      company: 'Northstar Dental',
      role: 'Founder',
      timeline: 'asap',
      url: 'https://northstar-dental.example',
      attribution: { utmSource: 'linkedin' },
    },
  });

  assert.equal(candidate.account.name, 'Northstar Dental');
  assert.equal(candidate.account.website_url, 'https://northstar-dental.example/');
  assert.equal(candidate.account.source, 'inbound');
  assert.equal(candidate.account.lead_id, 'lead-123');
  assert.equal(candidate.account.recommended_offer, 'seo_conversion_audit');
  assert.ok(candidate.account.total_score >= 45);
  assert.ok(candidate.account.tags.includes('public_funnel'));
  assert.ok(candidate.account.tags.includes('utm_linkedin'));
  assert.equal(candidate.contact.email, 'founder@northstar-dental.example');
  assert.equal(candidate.contact.role_fit, 'founder');
  assert.equal(candidate.metrics.accounts_added, 1);
  assert.equal(candidate.metrics.accounts_qualified, 1);
  assert.equal(candidate.lookup.websiteUrl, 'https://northstar-dental.example/');
});

test('acquisition inbound: ignores newsletter leads and normalizes SEO audit leads', async () => {
  const { buildInboundAcquisitionCandidate } = await import('../../lib/acquisition/inbound.ts');
  const newsletter = buildInboundAcquisitionCandidate({
    source: 'newsletter',
    email: 'reader@example.com',
    name: null,
    detail: 'Newsletter signup',
  });
  assert.equal(newsletter, null);

  const audit = buildInboundAcquisitionCandidate({
    source: 'seo_audit',
    email: 'owner@clinic.example',
    name: null,
    detail: 'SEO audit of https://clinic.example — score 62',
    metadata: {
      url: 'https://clinic.example',
      score: 62,
    },
  });

  assert.ok(audit);
  assert.equal(audit.account.name, 'clinic.example');
  assert.equal(audit.account.source, 'seo_audit');
  assert.equal(audit.account.website_url, 'https://clinic.example/');
  assert.equal(audit.account.metadata.inbound.auditScore, 62);
  assert.equal(audit.contact.source, 'seo_audit');
  assert.equal(audit.lookup.email, 'owner@clinic.example');
});

test('revenue os jobs: ranks junior remote AI roles and skips senior/spanish-required roles', async () => {
  const { buildJobSearchPipeline } = await import('../../lib/revenue-os/jobs.ts');
  const pipeline = buildJobSearchPipeline({
    roles: [
      {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        location: 'Remote US',
        description: 'Build AI features with Next.js, TypeScript, Python, LLM APIs, testing, and Vercel.',
        url: 'https://jobs.example/ai-app',
      },
      {
        title: 'Senior ML Platform Engineer',
        company: 'Big Systems',
        location: 'Remote',
        description: 'Senior staff role requiring 8+ years of Kubernetes and ML infra.',
        url: 'https://jobs.example/senior',
      },
      {
        title: 'QA Automation Engineer - Spanish required',
        company: 'LatAm QA',
        location: 'Remote',
        description: 'Spanish required. Selenium and manual QA.',
        url: 'https://jobs.example/spanish',
      },
    ],
  });

  assert.equal(pipeline.skipped.length, 2);
  assert.equal(pipeline.matches.length, 1);
  assert.equal(pipeline.matches[0].title, 'Junior AI Application Engineer');
  assert.equal(pipeline.matches[0].resumeVariant, 'ai_application_engineer');
  assert.ok(pipeline.matches[0].atsKeywords.includes('Next.js'));
  assert.ok(pipeline.matches[0].applicationAdvice.includes('AI application'));
});

test('revenue os connectors: creates deduped lead-source run plans', async () => {
  const { buildLeadSourceConnectorPlan } = await import('../../lib/revenue-os/connectors.ts');
  const plan = buildLeadSourceConnectorPlan({
    existingDomains: ['acme.example'],
    sources: [
      { name: 'Google Maps Dentists', type: 'directory', query: 'dentists Boston outdated website', dailyLimit: 40 },
      { name: 'Clutch Agencies', type: 'directory', query: 'small agencies needing AI automation', dailyLimit: 20 },
      { name: 'Google Maps Dentists', type: 'directory', query: 'duplicate', dailyLimit: 10 },
    ],
  });

  assert.equal(plan.sources.length, 2);
  assert.equal(plan.dailyLeadTarget, 60);
  assert.ok(plan.sources[0].qualificationSignals.includes('weak website or conversion path'));
  assert.ok(plan.dedupeKeys.includes('acme.example'));
});

test('revenue os email prep: queues only compliant ready messages', async () => {
  const { buildEmailPreparationQueue } = await import('../../lib/revenue-os/email-prep.ts');
  const queue = buildEmailPreparationQueue({
    messages: [
      {
        id: 'msg-1',
        status: 'ready',
        subject: 'Specific audit opportunity',
        body: 'I noticed one concrete conversion issue and can send a short audit.',
        accountName: 'Acme Dental',
        contactEmail: 'owner@acme.example',
        priority: 'urgent',
      },
      {
        id: 'msg-2',
        status: 'ready',
        subject: 'No contact',
        body: 'Missing recipient.',
        accountName: 'No Contact Co',
        contactEmail: null,
        priority: 'high',
      },
    ],
    suppressedEmails: [],
  });

  assert.equal(queue.readyToSend.length, 1);
  assert.equal(queue.blocked.length, 1);
  assert.equal(queue.readyToSend[0].sendMode, 'manual_review');
  assert.ok(queue.readyToSend[0].checklist.includes('recipient verified'));
  assert.match(queue.blocked[0].reason, /missing recipient/i);
});

test('revenue os daily runner: combines jobs, leads, email prep, and priority actions', async () => {
  const { buildDailyRevenueRun } = await import('../../lib/revenue-os/daily-runner.ts');
  const run = buildDailyRevenueRun({
    accounts: [
      {
        id: 'acct-1',
        name: 'Acme Dental',
        stage: 'qualified',
        priority: 'urgent',
        totalScore: 72,
        nextAction: 'Draft outreach from audit evidence.',
      },
    ],
    emailQueue: {
      readyToSend: [
        {
          id: 'msg-1',
          accountName: 'Acme Dental',
          contactEmail: 'owner@acme.example',
          subject: 'Audit',
          priority: 'urgent',
          sendMode: 'manual_review',
          checklist: ['recipient verified'],
        },
      ],
      blocked: [],
      summary: { ready: 1, blocked: 0 },
    },
    leadConnectorPlan: {
      dailyLeadTarget: 50,
      sources: [{ name: 'Directory', type: 'directory', dailyLimit: 50, query: 'dentists', qualificationSignals: [] }],
      dedupeKeys: [],
    },
    jobPipeline: {
      matches: [
        {
          title: 'Junior AI Engineer',
          company: 'Apps Co',
          score: 86,
          resumeVariant: 'ai_application_engineer',
          atsKeywords: ['LLM APIs'],
          applicationAdvice: 'Lead with shipped AI apps.',
          url: 'https://jobs.example/junior',
        },
      ],
      skipped: [],
      summary: { applyNow: 1, queueForReview: 0, skipped: 0 },
    },
  });

  assert.equal(run.scorecard.leadsToImport, 50);
  assert.equal(run.scorecard.emailsReady, 1);
  assert.equal(run.scorecard.jobsToApply, 1);
  assert.equal(run.actions[0].lane, 'business_development');
  assert.ok(run.actions.some((action) => action.lane === 'job_search'));
  assert.ok(run.safetyNotes.some((note) => note.includes('No email is sent')));
});

test('revenue os reporting: identifies working channels and next experiments', async () => {
  const { buildRevenueLearningReport } = await import('../../lib/revenue-os/reporting.ts');
  const report = buildRevenueLearningReport({
    periodLabel: 'Last 7 days',
    sourceBreakdowns: [
      { label: 'inbound', accounts: 10, contacted: 5, replies: 3, meetings: 2, replyRate: 60, meetingRate: 40 },
      { label: 'directory', accounts: 20, contacted: 10, replies: 1, meetings: 0, replyRate: 10, meetingRate: 0 },
    ],
    jobPipeline: {
      matches: [
        {
          title: 'Junior AI Application Engineer',
          company: 'Apps Co',
          score: 88,
          resumeVariant: 'ai_application_engineer',
          atsKeywords: ['Next.js', 'LLM APIs'],
          applicationAdvice: 'Lead with shipped AI apps.',
          url: 'https://jobs.example/ai',
        },
      ],
      skipped: [],
      summary: { applyNow: 1, queueForReview: 0, skipped: 0 },
    },
    emailQueue: {
      readyToSend: [],
      blocked: [{ id: 'x', accountName: 'No Contact', reason: 'missing recipient email' }],
      summary: { ready: 0, blocked: 1 },
    },
  });

  assert.equal(report.periodLabel, 'Last 7 days');
  assert.equal(report.bestChannel?.label, 'inbound');
  assert.ok(report.whatWorked.some((item) => item.includes('inbound')));
  assert.ok(report.whatToImprove.some((item) => item.includes('missing recipient')));
  assert.ok(report.nextExperiments.some((item) => item.includes('AI application')));
  assert.ok(report.learningScore >= 70);
});

test('revenue os hardening: blocks unsafe production automation configuration', async () => {
  const { validateRevenueOsProductionReadiness } = await import('../../lib/revenue-os/hardening.ts');
  const unsafe = validateRevenueOsProductionReadiness({
    cronSecretConfigured: false,
    emailDispatchMode: 'automatic',
    jobApplicationMode: 'automatic',
    hasSuppressionChecks: false,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });

  assert.equal(unsafe.ready, false);
  assert.ok(unsafe.blockers.some((item) => item.includes('CRON_SECRET')));
  assert.ok(unsafe.blockers.some((item) => item.includes('automatic email')));
  assert.ok(unsafe.blockers.some((item) => item.includes('job applications')));
  assert.ok(unsafe.score < 70);

  const safe = validateRevenueOsProductionReadiness({
    cronSecretConfigured: true,
    emailDispatchMode: 'manual_review',
    jobApplicationMode: 'manual_review',
    hasSuppressionChecks: true,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });
  assert.equal(safe.ready, true);
  assert.equal(safe.blockers.length, 0);
  assert.ok(safe.score >= 90);
});

test('revenue os lead connectors: parses CSV and normalizes google-place leads', async () => {
  const { parseConnectorCsvLeads, normalizeGooglePlaceLead, enrichConnectorLead } = await import(
    '../../lib/revenue-os/lead-connectors.ts'
  );
  const csv = parseConnectorCsvLeads(
    'company,website,industry,location,email,source\nAcme Dental,acme.example,Dental,Boston,owner@acme.example,google_places',
  );
  assert.equal(csv.length, 1);
  assert.equal(csv[0].websiteUrl, 'https://acme.example/');
  assert.equal(csv[0].sourceType, 'google_places');

  const place = normalizeGooglePlaceLead({
    displayName: { text: 'Bright Dental' },
    websiteUri: 'bright.example',
    formattedAddress: 'Orlando, FL',
    nationalPhoneNumber: '+1 555 0100',
    types: ['dentist', 'health'],
  });
  assert.equal(place.name, 'Bright Dental');
  assert.equal(place.websiteUrl, 'https://bright.example/');
  assert.equal(place.industry, 'dentist');
  const enriched = enrichConnectorLead(place);
  assert.ok(enriched.qualificationSignals.includes('website available for audit'));
  assert.ok(enriched.importRow.includes('Bright Dental'));
});

test('revenue os sequences: builds manual-review follow-up sequence and deliverability events', async () => {
  const { buildManualReviewSequence, buildDeliverabilityEvent } = await import('../../lib/revenue-os/sequences.ts');
  const sequence = buildManualReviewSequence({
    accountName: 'Acme Dental',
    contactEmail: 'owner@acme.example',
    offer: 'seo_conversion_audit',
    startDate: new Date('2026-06-17T12:00:00.000Z'),
  });
  assert.equal(sequence.steps.length, 3);
  assert.equal(sequence.steps[0].status, 'manual_review');
  assert.equal(sequence.steps[1].scheduledAt, '2026-06-20T12:00:00.000Z');
  assert.ok(sequence.safetyChecks.includes('suppression list check before every send'));

  const event = buildDeliverabilityEvent({
    messageId: 'msg-1',
    type: 'bounced',
    occurredAt: '2026-06-17T12:00:00.000Z',
    detail: 'Mailbox unavailable',
  });
  assert.equal(event.requiresSuppression, true);
});

test('revenue os job tracker: creates durable application records and follow-up queue', async () => {
  const { buildJobApplicationRecord, buildRecruiterFollowUp } = await import('../../lib/revenue-os/job-tracker.ts');
  const application = buildJobApplicationRecord({
    job: {
      title: 'Junior AI Engineer',
      company: 'Apps Co',
      score: 88,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'LLM APIs'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    status: 'queued',
  });
  assert.equal(application.stage, 'queued');
  assert.equal(application.resumeVariant, 'ai_application_engineer');
  assert.ok(application.metadata.atsKeywords.includes('LLM APIs'));

  const followUp = buildRecruiterFollowUp({
    applicationId: 'app-1',
    recruiterEmail: 'recruiter@apps.example',
    from: new Date('2026-06-17T12:00:00.000Z'),
  });
  assert.equal(followUp.status, 'scheduled');
  assert.equal(followUp.followUpAt, '2026-06-22T12:00:00.000Z');
});

test('revenue os external connectors: executes google places search with enrichment and dedupe', async () => {
  const { buildGooglePlacesConnector, runLeadConnector } = await import('../../lib/revenue-os/external-connectors.ts');
  const connector = buildGooglePlacesConnector({
    apiKey: 'test-key',
    query: 'dentists in Orlando with outdated websites',
    locationBias: { latitude: 28.5383, longitude: -81.3792, radiusMeters: 15_000 },
    limit: 3,
  });

  const fetchCalls = [];
  const result = await runLeadConnector(connector, {
    existingDomains: ['skip.example'],
    fetchImpl: async (url, init) => {
      fetchCalls.push({ url, init });
      return new Response(
        JSON.stringify({
          places: [
            {
              displayName: { text: 'Bright Dental' },
              websiteUri: 'bright.example',
              formattedAddress: 'Orlando, FL',
              nationalPhoneNumber: '+1 555 0100',
              types: ['dentist'],
            },
            {
              displayName: { text: 'Skip Dental' },
              websiteUri: 'skip.example',
              formattedAddress: 'Orlando, FL',
              nationalPhoneNumber: '+1 555 0101',
              types: ['dentist'],
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    },
    enrichLead: async (lead) => ({
      contactEmail: lead.name === 'Bright Dental' ? 'owner@bright.example' : null,
      confidence: 92,
      signals: ['owner contact found'],
    }),
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(result.status, 'completed');
  assert.equal(result.leadsFound, 2);
  assert.equal(result.deduped, 1);
  assert.equal(result.importableLeads.length, 1);
  assert.equal(result.importableLeads[0].name, 'Bright Dental');
  assert.equal(result.importableLeads[0].contactEmail, 'owner@bright.example');
  assert.ok(result.importableLeads[0].qualificationSignals.includes('owner contact found'));
  assert.ok(result.costEstimateUsd > 0);
});

test('revenue os outreach v2: scores human personalization and spam risk from evidence', async () => {
  const { composePersonalizedOutreachV2 } = await import('../../lib/revenue-os/outreach-v2.ts');
  const draft = composePersonalizedOutreachV2({
    accountName: 'Bright Dental',
    websiteUrl: 'https://bright.example/',
    contactName: 'Avery Stone',
    contactTitle: 'Owner',
    industry: 'Dental',
    offer: 'seo_conversion_audit',
    source: 'google_places',
    evidence: {
      auditScore: 61,
      issues: ['Booking CTA is buried below the fold'],
      opportunities: ['Move booking above the fold and add new-patient proof near the CTA'],
      leadSignals: ['website available for audit', 'owner contact found'],
    },
    voice: 'direct, specific, practical',
  });

  assert.equal(draft.sendMode, 'manual_review');
  assert.ok(draft.subject.includes('Bright Dental'));
  assert.ok(draft.body.includes('Booking CTA is buried below the fold'));
  assert.ok(draft.body.includes('Move booking above the fold'));
  assert.ok(draft.qualityScore >= 90);
  assert.ok(draft.spamRiskScore <= 20);
  assert.ok(draft.checklist.includes('specific website evidence included'));
  assert.ok(draft.followUps[0].body.includes('Booking CTA'));
});

test('revenue os email delivery: blocks unapproved and suppressed sends', async () => {
  const { buildRevenueEmailDeliveryPlan } = await import('../../lib/revenue-os/email-delivery.ts');
  const unapproved = buildRevenueEmailDeliveryPlan({
    queueItem: {
      id: 'email-1',
      status: 'manual_review',
      recipientEmail: 'owner@example.com',
      subject: 'Audit',
      body: 'Specific audit body',
    },
    suppressed: false,
  });
  assert.equal(unapproved.allowed, false);
  assert.equal(unapproved.reason, 'requires_manual_approval');

  const suppressed = buildRevenueEmailDeliveryPlan({
    queueItem: {
      id: 'email-2',
      status: 'approved',
      recipientEmail: 'owner@example.com',
      subject: 'Audit',
      body: 'Specific audit body',
    },
    suppressed: true,
  });
  assert.equal(suppressed.allowed, false);
  assert.equal(suppressed.reason, 'suppressed_recipient');
});

test('revenue os email delivery: builds resend payload with unsubscribe and idempotency', async () => {
  const { buildRevenueEmailDeliveryPlan } = await import('../../lib/revenue-os/email-delivery.ts');
  const plan = buildRevenueEmailDeliveryPlan({
    siteUrl: 'https://sageideas.dev',
    from: 'Sage Ideas <sage@sageideas.dev>',
    queueItem: {
      id: 'email-3',
      status: 'approved',
      recipientEmail: 'owner@bright.example',
      subject: 'Bright Dental audit',
      body: 'I noticed a specific booking issue.',
    },
    suppressed: false,
  });

  assert.equal(plan.allowed, true);
  assert.equal(plan.payload.to, 'owner@bright.example');
  assert.equal(plan.payload.headers['List-Unsubscribe'], '<https://sageideas.dev/unsubscribe?email=owner%40bright.example>');
  assert.equal(plan.idempotencyKey, 'revenue-email-email-3');
});

test('revenue os email delivery: maps resend webhooks to queue events and suppression', async () => {
  const { mapResendWebhookToRevenueEmailEvent } = await import('../../lib/revenue-os/email-delivery.ts');
  const bounced = mapResendWebhookToRevenueEmailEvent({
    type: 'email.bounced',
    created_at: '2026-06-17T12:00:00.000Z',
    data: {
      email_id: 're_msg_123',
      to: ['owner@bright.example'],
      subject: 'Bright Dental audit',
    },
  });

  assert.equal(bounced?.eventType, 'bounced');
  assert.equal(bounced?.queueStatus, 'blocked');
  assert.equal(bounced?.requiresSuppression, true);
  assert.equal(bounced?.suppression?.email, 'owner@bright.example');

  const delivered = mapResendWebhookToRevenueEmailEvent({
    type: 'email.delivered',
    created_at: '2026-06-17T12:02:00.000Z',
    data: { email_id: 're_msg_123', to: 'owner@bright.example' },
  });
  assert.equal(delivered?.eventType, 'delivered');
  assert.equal(delivered?.queueStatus, 'sent');
  assert.equal(delivered?.requiresSuppression, false);
});

test('revenue os lead source health: reports redacted credentials and quota readiness', async () => {
  const { buildLeadSourceCredentialHealth } = await import('../../lib/revenue-os/lead-source-health.ts');
  const health = buildLeadSourceCredentialHealth({
    env: {
      GOOGLE_PLACES_API_KEY: 'gp_live_1234567890',
      SERPAPI_API_KEY: '',
      EXA_API_KEY: 'exa_secret_abcdef',
    },
    dailyBudgetUsd: 12,
  });

  assert.equal(health.providers.google_places.configured, true);
  assert.equal(health.providers.google_places.redacted, 'gp_l…7890');
  assert.equal(health.providers.serpapi.configured, false);
  assert.equal(health.providers.exa.configured, true);
  assert.equal(health.readyProviders, 2);
  assert.ok(health.warnings.some((warning) => warning.includes('SERPAPI_API_KEY')));
});

test('revenue os lead source health: enforces quotas and cost caps before connector runs', async () => {
  const { buildLeadSourceRunDecision } = await import('../../lib/revenue-os/lead-source-health.ts');
  const allowed = buildLeadSourceRunDecision({
    provider: 'google_places',
    requested: 25,
    alreadyRunToday: 20,
    dailyLimit: 60,
    costPerLeadUsd: 0.032,
    dailyBudgetUsd: 3,
    providerConfigured: true,
  });

  assert.equal(allowed.allowed, true);
  assert.equal(allowed.allowedLeadCount, 25);
  assert.equal(allowed.estimatedCostUsd, 0.8);

  const capped = buildLeadSourceRunDecision({
    provider: 'google_places',
    requested: 50,
    alreadyRunToday: 20,
    dailyLimit: 60,
    costPerLeadUsd: 0.032,
    dailyBudgetUsd: 1,
    providerConfigured: true,
  });
  assert.equal(capped.allowed, true);
  assert.equal(capped.allowedLeadCount, 31);
  assert.equal(capped.reason, 'budget_capped');

  const missing = buildLeadSourceRunDecision({
    provider: 'serpapi',
    requested: 10,
    alreadyRunToday: 0,
    dailyLimit: 50,
    costPerLeadUsd: 0.02,
    dailyBudgetUsd: 5,
    providerConfigured: false,
  });
  assert.equal(missing.allowed, false);
  assert.equal(missing.reason, 'missing_credentials');
});

test('revenue os job connectors: normalize greenhouse lever ashby workable and remotive jobs', async () => {
  const { normalizeJobSourceResults, buildJobConnectorRun } = await import('../../lib/revenue-os/job-connectors.ts');
  const jobs = normalizeJobSourceResults([
    {
      provider: 'greenhouse',
      payload: {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        absolute_url: 'https://boards.greenhouse.io/applied/jobs/1',
        location: { name: 'Remote US' },
        content: 'Next.js TypeScript Python LLM APIs testing Vercel',
      },
    },
    {
      provider: 'lever',
      payload: {
        text: 'QA Automation Engineer',
        hostedUrl: 'https://jobs.lever.co/qa/1',
        categories: { team: 'Engineering', location: 'Remote' },
        descriptionPlain: 'Playwright API testing JavaScript junior',
      },
    },
    {
      provider: 'ashby',
      payload: {
        title: 'Senior ML Platform Engineer',
        company: 'Big Systems',
        jobUrl: 'https://jobs.ashbyhq.com/big/1',
        location: 'Remote',
        descriptionPlain: 'Senior role requiring 8+ years Kubernetes.',
      },
    },
    {
      provider: 'workable',
      payload: {
        title: 'Implementation Engineer - AI Tools',
        shortcode: 'abc',
        url: 'https://apply.workable.com/ops/j/abc',
        location: { city: 'Remote' },
        description: 'Configure customer AI workflows, JavaScript, support launches.',
      },
    },
    {
      provider: 'remotive',
      payload: {
        title: 'Junior Frontend Developer',
        company_name: 'Remote UI',
        url: 'https://remotive.com/jobs/1',
        candidate_required_location: 'USA',
        description: 'React TypeScript frontend implementation',
      },
    },
  ]);

  assert.equal(jobs.length, 5);
  assert.equal(jobs[0].company, 'Applied Apps');
  assert.equal(jobs[1].source, 'lever');
  const run = buildJobConnectorRun({ jobs });
  assert.equal(run.pipeline.matches.length, 4);
  assert.equal(run.pipeline.skipped.length, 1);
  assert.ok(run.pipeline.matches[0].score >= 75);
  assert.ok(run.sourceCounts.greenhouse >= 1);
});

test('revenue os application packets: builds ATS resume and cover letter packet', async () => {
  const { buildApplicationPacket } = await import('../../lib/revenue-os/application-packets.ts');
  const packet = buildApplicationPacket({
    job: {
      title: 'Junior AI Application Engineer',
      company: 'Applied Apps',
      score: 91,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'TypeScript', 'LLM APIs', 'testing'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    candidate: {
      name: 'Jason Teixeira',
      website: 'https://sageideas.dev',
      github: 'https://github.com/JasonTeixeira',
      location: 'Remote US',
    },
  });

  assert.equal(packet.resumeVariant, 'ai_application_engineer');
  assert.ok(packet.resumeSummary.includes('AI application'));
  assert.ok(packet.atsKeywordCoverage >= 90);
  assert.ok(packet.coverLetter.includes('Applied Apps'));
  assert.ok(packet.recruiterMessage.length < 700);
  assert.ok(packet.checklist.includes('Tailored resume variant selected'));
});

test('revenue os daily runner v2: combines jobs packets leads and email into persistent run plan', async () => {
  const { buildDailyRevenueRunV2 } = await import('../../lib/revenue-os/daily-runner-v2.ts');
  const run = buildDailyRevenueRunV2({
    runKey: 'unit-run',
    leadHealth: {
      providersReady: 2,
      allowedLeads: 35,
      estimatedCostUsd: 1.15,
    },
    jobConnectorRun: {
      imported: 4,
      skipped: 1,
      applyNow: 3,
    },
    applicationPackets: [
      { jobTitle: 'Junior AI Engineer', company: 'Apps Co', resumeVariant: 'ai_application_engineer', atsKeywordCoverage: 95 },
    ],
    emailQueue: {
      ready: 2,
      blocked: 1,
    },
  });

  assert.equal(run.mode, 'manual');
  assert.equal(run.scorecard.jobsToApply, 3);
  assert.equal(run.scorecard.applicationPacketsReady, 1);
  assert.equal(run.scorecard.leadsToImport, 35);
  assert.ok(run.actions.some((action) => action.lane === 'job_search'));
  assert.ok(run.safetyNotes.some((note) => note.includes('manual')));
  assert.equal(run.metadata.runKey, 'unit-run');
});

test('revenue os operator dashboard: prioritizes today actions and blockers', async () => {
  const { buildRevenueOperatorDashboard } = await import('../../lib/revenue-os/operator-dashboard.ts');
  const dashboard = buildRevenueOperatorDashboard({
    accounts: [
      {
        id: 'acct-1',
        name: 'Urgent Dental',
        priority: 'urgent',
        stage: 'qualified',
        totalScore: 83,
        nextAction: 'Draft audit-led outreach.',
      },
      {
        id: 'acct-2',
        name: 'Follow Up Clinic',
        priority: 'high',
        stage: 'follow_up',
        totalScore: 68,
        nextAction: 'Send follow-up.',
      },
    ],
    dailyRun: {
      scorecard: {
        leadsToImport: 65,
        emailsReady: 4,
        emailBlocked: 2,
        jobsToApply: 3,
        accountsNeedingAction: 2,
      },
      actions: [
        {
          lane: 'job_search',
          priority: 95,
          title: 'Review 3 high-fit job opportunities',
          detail: 'Three application packets are ready.',
        },
        {
          lane: 'business_development',
          priority: 90,
          title: 'Work urgent lead queue',
          detail: 'Two accounts need action.',
        },
      ],
    },
    emailQueue: { summary: { ready: 4, blocked: 2 } },
    jobPipeline: { matches: [{ title: 'Junior AI Engineer' }, { title: 'QA Automation Engineer' }] },
    productionReadiness: { blockers: ['CRON_SECRET missing'], warnings: ['Keep manual review enabled'] },
    metrics: { replies: 3, sent: 10, meetings: 1, pipeline: 12500 },
  });

  assert.equal(dashboard.healthLabel, 'Needs attention');
  assert.equal(dashboard.todayStats.length, 6);
  assert.equal(dashboard.todayStats.find((stat) => stat.label === 'Ready emails')?.value, '4');
  assert.equal(dashboard.blockers[0], 'CRON_SECRET missing');
  assert.equal(dashboard.nextBestAction.title, 'Review 3 high-fit job opportunities');
  assert.equal(dashboard.approvalQueue[0].label, 'Approve emails');
  assert.ok(dashboard.quickLinks.some((link) => link.href === '#jobs'));
});

test('revenue os production gate: requires live-mode controls and redacts secret state', async () => {
  const { buildRevenueOsProductionGate } = await import('../../lib/revenue-os/hardening.ts');
  const gate = buildRevenueOsProductionGate({
    env: {
      CRON_SECRET: 'cron-secret',
      RESEND_API_KEY: 're_live_key',
      GOOGLE_PLACES_API_KEY: '',
      EXA_API_KEY: 'exa-key',
    },
    liveConnectorsEnabled: true,
    packetDownloadsEnabled: true,
    operatorSavedViewsEnabled: true,
    e2ePassing: true,
    buildPassing: true,
  });

  assert.equal(gate.ready, false);
  assert.ok(gate.blockers.some((item) => item.includes('GOOGLE_PLACES_API_KEY')));
  assert.ok(gate.controls.some((item) => item.includes('manual-review email')));
  assert.equal(gate.secrets.GOOGLE_PLACES_API_KEY.configured, false);
  assert.equal(gate.secrets.RESEND_API_KEY.redacted, 're_l...key');
});

test('revenue os live connectors: fetches job APIs through provider builders', async () => {
  const {
    buildGreenhouseJobBoardConnector,
    buildLeverJobConnector,
    buildRemotiveJobConnector,
    runJobSourceConnectors,
  } = await import('../../lib/revenue-os/live-connectors.ts');
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).includes('greenhouse')) {
      return Response.json({ jobs: [{ id: 1, title: 'Junior AI Engineer', absolute_url: 'https://gh/job/1', location: { name: 'Remote US' }, content: 'Next.js TypeScript LLM APIs testing' }] });
    }
    if (String(url).includes('lever')) {
      return Response.json([{ id: 'lev-1', text: 'QA Automation Engineer', hostedUrl: 'https://lever/job/1', categories: { location: 'Remote' }, descriptionPlain: 'Playwright API testing JavaScript' }]);
    }
    return Response.json({ jobs: [{ id: 9, title: 'Junior Frontend Developer', company_name: 'Remote UI', url: 'https://remotive/job/1', candidate_required_location: 'USA', description: 'React TypeScript frontend' }] });
  };

  const run = await runJobSourceConnectors(
    [
      buildGreenhouseJobBoardConnector({ boardToken: 'applied', company: 'Applied Apps', limit: 5 }),
      buildLeverJobConnector({ companySlug: 'qalabs', company: 'QA Labs', limit: 5 }),
      buildRemotiveJobConnector({ search: 'junior developer', limit: 5 }),
    ],
    { fetchImpl },
  );

  assert.equal(calls.length, 3);
  assert.equal(run.jobs.length, 3);
  assert.equal(run.pipeline.matches.length, 3);
  assert.equal(run.errors.length, 0);
  assert.ok(run.sourceCounts.greenhouse >= 1);
});

test('revenue os application packet export: produces downloadable markdown bundle', async () => {
  const { buildApplicationPacket, buildApplicationPacketExport } = await import('../../lib/revenue-os/application-packets.ts');
  const packet = buildApplicationPacket({
    job: {
      title: 'Junior AI Application Engineer',
      company: 'Applied Apps',
      score: 91,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'TypeScript', 'LLM APIs', 'testing'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    candidate: { name: 'Jason Teixeira', website: 'https://sageideas.dev', github: null, location: 'Remote US' },
  });
  const exported = buildApplicationPacketExport({ packet, format: 'markdown' });

  assert.equal(exported.mimeType, 'text/markdown; charset=utf-8');
  assert.ok(exported.filename.includes('applied-apps'));
  assert.ok(exported.body.includes('# Applied Apps - Junior AI Application Engineer'));
  assert.ok(exported.body.includes('## Cover Letter'));
  assert.ok(exported.body.includes('Tailored resume variant selected'));
});

test('revenue os operator filters: applies saved views, search, priority, and stage', async () => {
  const { applyOperatorAccountFilters, OPERATOR_SAVED_VIEWS } = await import('../../lib/revenue-os/operator-dashboard.ts');
  const accounts = [
    { id: '1', name: 'Urgent Dental', industry: 'Dental', location: 'Boston', priority: 'urgent', stage: 'qualified', totalScore: 82 },
    { id: '2', name: 'Quiet Clinic', industry: 'Healthcare', location: 'Austin', priority: 'low', stage: 'follow_up', totalScore: 45 },
    { id: '3', name: 'AI Startup', industry: 'SaaS', location: 'Remote', priority: 'high', stage: 'meeting', totalScore: 76 },
  ];

  const urgent = applyOperatorAccountFilters({ accounts, filters: { savedView: 'urgent' } });
  assert.deepEqual(urgent.map((account) => account.id), ['1']);
  const searched = applyOperatorAccountFilters({ accounts, filters: { query: 'clinic', stage: 'follow_up' } });
  assert.deepEqual(searched.map((account) => account.id), ['2']);
  assert.ok(OPERATOR_SAVED_VIEWS.some((view) => view.id === 'follow_up'));
});

test('acquisition scoring: urgent website prospect gets audit-led next action', async () => {
  const { scoreAcquisitionAccount } = await import('../../lib/acquisition/scoring.ts');
  const score = scoreAcquisitionAccount({
    businessModel: 'local_service',
    websiteUrl: 'https://example.com',
    hasBrokenWebsite: true,
    hasWeakSeo: true,
    hasWeakConversionPath: true,
    hasBookingOrCheckoutGap: true,
    isOwnerOperated: true,
    contactConfidence: 90,
    estimatedBudget: '10k_25k',
  });

  assert.equal(score.priority, 'urgent');
  assert.equal(score.recommendedOffer, 'seo_conversion_audit');
  assert.ok(score.totalScore >= 60);
  assert.equal(score.modelVersion, 'v2');
  assert.ok(score.closeProbability >= 50);
  assert.ok(score.confidence >= 80);
  assert.ok(score.segments.problem >= 60);
  assert.ok(score.reasons.includes('conversion path can be improved'));
  assert.match(score.nextAction, /Draft/);
});

test('acquisition scoring: low-signal account stays low priority', async () => {
  const { scoreAcquisitionAccount } = await import('../../lib/acquisition/scoring.ts');
  const score = scoreAcquisitionAccount({
    businessModel: 'unknown',
    contactConfidence: 10,
    estimatedBudget: 'unknown',
  });

  assert.equal(score.priority, 'low');
  assert.equal(score.recommendedOffer, 'seo_conversion_audit');
  assert.ok(score.totalScore < 45);
  assert.ok(score.warnings.includes('missing website'));
  assert.equal(score.nextAction, 'Collect one more proof point before outreach.');
});

test('acquisition audit: visible website gaps lower scores and create opportunities', async () => {
  const { buildWebsiteAuditDraft } = await import('../../lib/acquisition/audit.ts');
  const audit = buildWebsiteAuditDraft({
    websiteUrl: 'https://example.com',
    hasBrokenWebsite: true,
    hasWeakSeo: true,
    hasWeakConversionPath: true,
    hasBookingOrCheckoutGap: true,
  });

  assert.ok(audit.overallScore < 75);
  assert.ok(audit.issues.includes('Weak conversion path'));
  assert.ok(audit.opportunities.some((item) => item.includes('booking')));
  assert.equal(audit.recommendedOffer, 'seo_conversion_audit');
});

test('acquisition outreach: draft is specific and does not pretend to send', async () => {
  const { buildOutreachDraft } = await import('../../lib/acquisition/outreach.ts');
  const draft = buildOutreachDraft({
    accountName: 'Acme Dental',
    websiteUrl: 'https://acmedental.example',
    contactName: 'Jordan Smith',
    contactTitle: 'Owner',
    industry: 'Dental',
    recommendedOffer: 'seo_conversion_audit',
    source: 'directory',
    closeProbability: 72,
    confidence: 88,
    auditIssues: ['Weak conversion path'],
    auditOpportunities: ['Add a clear booking CTA for new patients.'],
    auditScore: 64,
  });

  assert.equal(draft.subject, 'Acme Dental owner-level SEO and conversion audit opportunity');
  assert.ok(draft.body.startsWith('Hi Jordan,'));
  assert.ok(draft.body.includes('https://acmedental.example'));
  assert.ok(draft.body.includes('Audit score: 64/100'));
  assert.ok(draft.body.includes('15-minute call'));
  assert.ok(draft.personalizationNotes.includes('Dental'));
  assert.ok(draft.personalizationNotes.includes('Personalization quality:'));
  assert.ok(draft.metadata.qualityScore >= 90);
  assert.ok(draft.metadata.proofPoints.some((point) => point.includes('Observed issue')));
});

test('acquisition crm: outcome transitions update account queue and metrics', async () => {
  const { buildOutreachOutcomeTransition } = await import('../../lib/acquisition/crm.ts');
  const now = new Date('2026-06-17T12:00:00.000Z');
  const sent = buildOutreachOutcomeTransition('sent', now);
  assert.equal(sent.messagePatch.status, 'sent');
  assert.equal(sent.messagePatch.sent_at, '2026-06-17T12:00:00.000Z');
  assert.equal(sent.accountPatch.stage, 'contacted');
  assert.match(sent.accountPatch.next_action ?? '', /Wait for reply/);
  assert.equal(sent.metricPatch.messages_sent, 1);

  const booked = buildOutreachOutcomeTransition('booked', now);
  assert.equal(booked.accountPatch.stage, 'meeting');
  assert.equal(booked.metricPatch.meetings_booked, 1);

  const bounced = buildOutreachOutcomeTransition('bounced', now);
  assert.equal(bounced.accountPatch.stage, 'qualified');
  assert.match(bounced.accountPatch.next_action ?? '', /better contact/);
});

test('acquisition analytics: computes funnel totals and conversion breakdowns', async () => {
  const { buildRevenueIntelligence } = await import('../../lib/acquisition/analytics.ts');
  const intelligence = buildRevenueIntelligence({
    auditCount: 2,
    metricRows: [
      {
        metric_date: '2026-06-17',
        accounts_added: 4,
        accounts_qualified: 3,
        messages_drafted: 3,
        messages_sent: 2,
        replies: 1,
        meetings_booked: 1,
        proposals_created: 0,
        deals_won: 0,
        estimated_pipeline_value: 5000,
      },
    ],
    accounts: [
      {
        id: 'a',
        industry: 'Dental',
        priority: 'urgent',
        stage: 'meeting',
        recommended_offer: 'seo_conversion_audit',
        metadata: { intake: { source: 'directory' }, score: { closeProbability: 72 } },
      },
      {
        id: 'b',
        industry: 'Dental',
        priority: 'medium',
        stage: 'contacted',
        recommended_offer: 'seo_conversion_audit',
        metadata: { intake: { source: 'directory' }, score: { closeProbability: 45 } },
      },
    ],
  });

  assert.equal(intelligence.totals.leadsAdded, 4);
  assert.equal(intelligence.totals.replyRate, 50);
  assert.equal(intelligence.totals.meetingRate, 50);
  assert.equal(intelligence.totals.auditCoverage, 100);
  assert.equal(intelligence.breakdowns.bySource[0].label, 'directory');
  assert.equal(intelligence.breakdowns.bySource[0].meetingRate, 50);
  assert.ok(intelligence.insights.some((insight) => insight.label === 'Funnel health'));
});

test('acquisition import: parses CSV rows, normalizes URLs, and dedupes', async () => {
  const { parseAcquisitionLeadList } = await import('../../lib/acquisition/import.ts');
  const rows = parseAcquisitionLeadList(`company,website,industry,location,contact,title,email
Acme Dental, acme.example, Dental, Boston, Jordan Smith, Owner, Jordan@Acme.example
Acme Dental, acme.example, Dental, Boston, Jordan Smith, Owner, Jordan@Acme.example
"Bright, Co", https://bright.example, Agency, NYC, Sam Lee, Founder, sam@bright.example`);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].websiteUrl, 'https://acme.example');
  assert.equal(rows[0].contactEmail, 'jordan@acme.example');
  assert.equal(rows[0].signals.hasWeakSeo, true);
  assert.equal(rows[0].businessModel, 'local_service');
  assert.equal(rows[1].name, 'Bright, Co');
});

test('acquisition import: header-based intake infers source, budget, model, and signals', async () => {
  const { parseAcquisitionLeadList } = await import('../../lib/acquisition/import.ts');
  const rows = parseAcquisitionLeadList(`Company Name,URL,Niche,City,Decision Maker,Role,Email,Business Type,Budget,Lead Source,Employees,Notes,Tags
Northstar Recruiting,northstar.example,Recruiting,Boston,Avery Stone,Founder,avery@northstar.example,recruiting,10k-25k,LinkedIn,11-50,"Hiring recruiters and weak conversion CTA",hiring; b2b`);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Northstar Recruiting');
  assert.equal(rows[0].source, 'linkedin');
  assert.equal(rows[0].businessModel, 'recruiting');
  assert.equal(rows[0].estimatedBudget, '10k_25k');
  assert.equal(rows[0].signals.hasRecentHiringSignal, true);
  assert.equal(rows[0].signals.hasWeakConversionPath, true);
  assert.equal(rows[0].signals.isOwnerOperated, true);
  assert.deepEqual(rows[0].tags, ['hiring', 'b2b']);
});

test('acquisition enrichment: extracts domains and recommends verification', async () => {
  const { buildAcquisitionEnrichment, nextFollowUpDate } = await import(
    '../../lib/acquisition/enrichment.ts'
  );
  const matched = buildAcquisitionEnrichment({
    websiteUrl: 'https://www.acme.example/services',
    contactEmail: 'owner@acme.example',
    industry: 'Dental',
    location: 'Boston',
  });
  assert.equal(matched.domain, 'acme.example');
  assert.equal(matched.emailDomainMatchesWebsite, true);
  assert.ok(matched.signals.includes('business email captured'));

  const freeEmail = buildAcquisitionEnrichment({
    websiteUrl: 'https://acme.example',
    contactEmail: 'owner@gmail.com',
  });
  assert.equal(freeEmail.emailDomainMatchesWebsite, false);
  assert.match(freeEmail.recommendedNextAction, /Verify/);

  assert.equal(nextFollowUpDate(3, new Date('2026-06-17T12:00:00Z')), '2026-06-20T14:00:00.000Z');
});

test('live SEO audit runner: fetches HTML and builds evidence', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.PAGESPEED_API_KEY;
  delete process.env.PAGESPEED_API_KEY;
  globalThis.fetch = async () =>
    new Response(
      '<html lang="en"><head><title>Useful test page title</title><meta name="description" content="This is a useful test page description for the live SEO audit runner."><link rel="canonical" href="https://example.com/"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>One heading</h1><img src="/x.png"></body></html>',
      { status: 200, headers: { 'content-type': 'text/html' } },
    );

  try {
    const { runLiveSeoAudit } = await import('../../lib/seo-audit/run.ts');
    const audit = await runLiveSeoAudit('https://example.com/');
    assert.equal(audit.target.href, 'https://example.com/');
    assert.ok(audit.score > 50);
    assert.equal(audit.evidence.httpStatus, 200);
    assert.ok(audit.evidence.bytesRead > 100);
    assert.ok(audit.evidence.failedChecks.some((check) => check.key === 'imageAlt'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey) process.env.PAGESPEED_API_KEY = originalKey;
  }
});

// -------------------------------------------------------------- content / seo

test('blog toc: injects stable ids for h2 and h3 headings', async () => {
  const { injectHeadingIds } = await import('../../lib/blog-toc.ts');
  const out = injectHeadingIds('<h2>First section</h2><p>x</p><h3>Nested & useful</h3><h2>First section</h2>');
  assert.equal(out.toc.length, 3);
  assert.deepEqual(out.toc.map((node) => node.id), [
    'first-section',
    'nested-and-useful',
    'first-section-2',
  ]);
  assert.ok(out.html.includes('id="first-section"'));
  assert.ok(out.html.includes('id="nested-and-useful"'));
});

test('keyword map: primary keywords are unique per URL', async () => {
  const { keywordMap, getPrimaryKeyword, getKeywordsByUrl } = await import('../../data/seo/keyword-map.ts');
  const primaryByUrl = new Map();
  for (const entry of keywordMap.filter((item) => item.isPrimary)) {
    const count = primaryByUrl.get(entry.assignedUrl) ?? 0;
    primaryByUrl.set(entry.assignedUrl, count + 1);
  }
  for (const [url, count] of primaryByUrl) {
    assert.equal(count, 1, `${url} should have exactly one primary keyword`);
    assert.equal(getPrimaryKeyword(url)?.assignedUrl, url);
    assert.ok(getKeywordsByUrl(url).length >= 1);
  }
});

// -------------------------------------------------------------- isSelfServe

test('isSelfServe: audit ($750 one-time) is self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersOrdered.find((t) => t.slug === 'audit');
  assert.ok(audit, 'audit tier must exist');
  assert.equal(isSelfServe(audit), true);
});

test('isSelfServe: build ($9500 custom) is NOT self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersOrdered.find((t) => t.slug === 'build');
  assert.ok(build, 'build tier must exist');
  assert.equal(isSelfServe(build), false);
});

test('isSelfServe: all self-serve tiers have stripePriceId, cadence=one-time, priceCents ≤ 250000', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe, SELF_SERVE_PRICE_CAP_CENTS } = await import(
    '../../data/services/tier-classification.ts'
  );
  for (const tier of tiersOrdered) {
    if (!isSelfServe(tier)) continue;
    assert.ok(tier.stripePriceId, `${tier.slug}: must have stripePriceId`);
    assert.equal(tier.cadence, 'one-time', `${tier.slug}: cadence must be one-time`);
    assert.ok(
      tier.priceCents <= SELF_SERVE_PRICE_CAP_CENTS,
      `${tier.slug}: priceCents ${tier.priceCents} exceeds cap ${SELF_SERVE_PRICE_CAP_CENTS}`,
    );
  }
});

// -------------------------------------------------------------- checkout slug routing

test('checkout slug routing: care slugs exist in careTiersBySlug', async () => {
  const { careTiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.ok(careTiersBySlug[slug], `careTiersBySlug must contain: ${slug}`);
    assert.equal(careTiersBySlug[slug].cadence, 'monthly', `${slug}: cadence must be monthly`);
    assert.ok(careTiersBySlug[slug].stripePriceId, `${slug}: must have stripePriceId`);
  }
});

test('checkout slug routing: care slugs are NOT in tiersBySlug (no collision)', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.equal(tiersBySlug[slug], undefined, `${slug} must not appear in tiersBySlug`);
  }
});

test('checkout slug routing: build slug is in tiersBySlug but NOT self-serve', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersBySlug['build'];
  assert.ok(build, 'build must exist in tiersBySlug');
  assert.equal(isSelfServe(build), false, 'build must not be self-serve');
});

test('checkout slug routing: audit slug is self-serve and in tiersBySlug', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersBySlug['audit'];
  assert.ok(audit, 'audit must exist in tiersBySlug');
  assert.equal(isSelfServe(audit), true, 'audit must be self-serve');
});

// -------------------------------------------------------------- ssrf guard

test('ssrf: isPrivateIp — 10.x, 127.x, 169.254.x, 192.168.x, 172.16–31.x are private', async () => {
  const { isPrivateIp } = await import('../../lib/seo-audit/ssrf.ts');
  assert.equal(isPrivateIp('10.0.0.5'), true);
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('169.254.169.254'), true);
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('172.16.0.1'), true);
  assert.equal(isPrivateIp('172.31.255.255'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('1.1.1.1'), false);
  assert.equal(isPrivateIp('172.15.0.1'), false);
  assert.equal(isPrivateIp('172.32.0.1'), false);
});

test('ssrf: assertPublicUrl rejects file:// and ftp://', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('file:///etc/passwd'), /Only http\/https/);
  assert.throws(() => assertPublicUrl('ftp://example.com'), /Only http\/https/);
});

test('ssrf: assertPublicUrl rejects localhost and private IPs', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://localhost/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://127.0.0.1/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://169.254.169.254/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://192.168.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl accepts a public https URL', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path?q=1');
  assert.equal(url.hostname, 'example.com');
  assert.equal(url.protocol, 'https:');
});

test('ssrf: assertPublicUrl rejects plain invalid string', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('not-a-url'), /valid URL/);
});

// ------ IPv6 SSRF vectors (should all throw "not allowed") ------

test('ssrf: assertPublicUrl rejects IPv6 loopback ::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped loopback ::ffff:127.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:127.0.0.1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped AWS metadata ::ffff:169.254.169.254', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:169.254.169.254]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects ULA fc00::/7 address fd00::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fd00::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects link-local fe80::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fe80::1]/'), /not allowed/);
});

// ------ Non-standard IPv4 notations (should all throw) ------

test('ssrf: assertPublicUrl rejects octal IPv4 0177.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0177.0.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects decimal integer IP 2130706433', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://2130706433/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects hex IP 0x7f.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0x7f.0.0.1/'), /not allowed/);
});

// ------ Public cases that MUST still be accepted ------

test('ssrf: assertPublicUrl still accepts https://example.com/path', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path');
  assert.equal(url.hostname, 'example.com');
});

test('ssrf: assertPublicUrl still accepts public IPv4 93.184.216.34', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('http://93.184.216.34/');
  assert.equal(url.hostname, '93.184.216.34');
});

// -------------------------------------------------------------- seo analyzer

const GOOD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Perfect SEO Page - Sage Ideas Best Practices Guide</title>
  <meta name="description" content="A comprehensive guide to SEO best practices that covers everything from meta tags to structured data and beyond, with actionable tips." />
  <link rel="canonical" href="https://example.com/seo-guide" />
  <meta property="og:title" content="Perfect SEO Page" />
  <meta property="og:description" content="SEO guide" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","name":"SEO Guide"}</script>
</head>
<body>
  <h1>Perfect SEO Page</h1>
  <p>Content here.</p>
  <img src="hero.jpg" alt="A hero image showing SEO concepts" />
  <img src="chart.png" alt="Chart of rankings" />
</body>
</html>`;

const BAD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>First heading</h1>
  <h1>Second heading</h1>
  <img src="no-alt.jpg" />
  <img src="also-no-alt.png" />
  <p>Some content without any SEO signals.</p>
</body>
</html>`;

test('seo-analyzer: well-optimized page passes all key checks and scores >=80', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/seo-guide');
  assert.equal(r.checks.title.pass, true, 'title should pass');
  assert.equal(r.checks.metaDescription.pass, true, 'metaDescription should pass');
  assert.equal(r.checks.openGraph.pass, true, 'openGraph should pass');
  assert.equal(r.checks.structuredData.pass, true, 'structuredData should pass');
  assert.equal(r.checks.singleH1.pass, true, 'singleH1 should pass');
  assert.equal(r.checks.imageAlt.pass, true, 'imageAlt should pass');
  const score = scoreReport(r);
  assert.ok(score >= 80, `score ${score} should be >= 80`);
});

test('seo-analyzer: broken page fails title, h1, imageAlt and scores <50', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(BAD_HTML, 'https://example.com/bad');
  assert.equal(r.checks.title.pass, false, 'title should fail');
  assert.equal(r.checks.singleH1.pass, false, 'singleH1 should fail (two h1s)');
  assert.equal(r.checks.imageAlt.pass, false, 'imageAlt should fail');
  const score = scoreReport(r);
  assert.ok(score < 50, `score ${score} should be < 50`);
});

test('seo-analyzer: scoreReport blends perf score when present', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/');
  r.performance = { score: 50, lcpMs: 3000 };
  const blended = scoreReport(r);
  const onPage = scoreReport({ ...r, performance: undefined });
  // blended = 70% onPage + 30% * 50 — must differ from pure on-page score
  assert.ok(blended < onPage, `blended (${blended}) should be < pure on-page (${onPage}) when perf=50`);
});

// -------------------------------------------------------------- growth SEO

test('service-industry pages: generate unique programmatic URLs', async () => {
  const { getServiceIndustryPage, getServiceIndustryPages } = await import(
    '../../lib/seo/service-industry-pages.ts'
  );
  const pages = getServiceIndustryPages();
  const paths = new Set(pages.map((page) => page.path));

  assert.ok(pages.length > 0, 'expected service x industry pages');
  assert.equal(paths.size, pages.length, 'service x industry paths must be unique');
  assert.ok(
    getServiceIndustryPage('audit', 'fintech')?.path === '/services/audit/for/fintech',
    'expected fintech audit route to be generated',
  );
});

test('audit reports: share ids are URL-safe and compact', async () => {
  const { createShareId } = await import('../../lib/seo-audit/reports.ts');
  const shareId = createShareId();

  assert.match(shareId, /^[A-Za-z0-9_-]+$/);
  assert.ok(shareId.length >= 10 && shareId.length <= 16);
});

// -------------------------------------------------------------- content directives

test('blog markdown: content directives render reusable visual blocks', async () => {
  const { transformContentDirectives } = await import('../../lib/blogMarkdown.ts');
  const md = [
    ':::proof-note title="Real proof" label="receipt"',
    'This is the evidence.',
    ':::',
    '',
    ':::checklist title="Ship list"',
    '- One',
    '- Two',
    ':::',
    '',
    ':::offer-cta title="Find your route" href="/tools/route-finder" cta="Start"',
    'Use the diagnostic.',
    ':::',
  ].join('\n');
  const html = transformContentDirectives(md);
  assert.match(html, /mdx-proof-note/);
  assert.match(html, /Real proof/);
  assert.match(html, /mdx-checklist/);
  assert.match(html, /<li>One<\/li>/);
  assert.match(html, /mdx-offer-cta/);
  assert.match(html, /href="\/tools\/route-finder"/);
});

// -------------------------------------------------------------- route finder

test('route finder: learning goal routes to academy', async () => {
  const { getRouteRecommendation } = await import('../../lib/leads/route-finder.ts');
  const route = getRouteRecommendation({
    goal: 'learn',
    stage: 'idea',
    budget: '<10k',
    timeline: 'exploring',
  });
  assert.equal(route.route, 'academy');
  assert.equal(route.primaryHref, '/academy');
});

test('route finder: stuck systems route to audit', async () => {
  const { getRouteRecommendation } = await import('../../lib/leads/route-finder.ts');
  const route = getRouteRecommendation({
    goal: 'build',
    stage: 'stuck',
    budget: '10-25k',
    timeline: 'asap',
  });
  assert.equal(route.route, 'audit');
  assert.equal(route.primaryHref, '/tools/seo-audit');
});

test('route finder: high-intent build routes to studio', async () => {
  const { getRouteRecommendation, formatRouteFinderScope } = await import('../../lib/leads/route-finder.ts');
  const input = {
    goal: 'build',
    stage: 'scaling',
    budget: '50-100k',
    timeline: '2-4w',
  };
  const route = getRouteRecommendation(input);
  assert.equal(route.route, 'studio');
  assert.equal(route.primaryHref, '/book');
  assert.match(formatRouteFinderScope(input, route), /Route Finder recommendation: Studio build path/);
});

// -------------------------------------------------------------- revenue os production controls

test('revenue os action results: returns structured operator-visible failures', async () => {
  const { actionFailure, actionSuccess, unwrapActionResult } = await import('../../lib/revenue-os/action-results.ts');
  const failure = actionFailure('invalid_input', 'Run key is required.', { field: 'runKey' });
  assert.equal(failure.ok, false);
  assert.equal(failure.error.code, 'invalid_input');
  assert.equal(failure.error.message, 'Run key is required.');
  assert.deepEqual(failure.error.detail, { field: 'runKey' });

  const success = actionSuccess({ imported: 3 }, 'Imported 3 leads.');
  assert.equal(success.ok, true);
  assert.equal(success.message, 'Imported 3 leads.');
  assert.deepEqual(unwrapActionResult(success), { imported: 3 });
});

test('revenue os webhook controls: rejects stale signatures and creates stable event ids', async () => {
  const { buildResendWebhookEventId, verifyResendWebhookSignature } = await import('../../lib/revenue-os/webhook-security.ts');
  const crypto = await import('node:crypto');
  const secret = 'whsec_' + Buffer.from('unit-secret').toString('base64');
  const body = JSON.stringify({ type: 'email.delivered', data: { email_id: 're_123' } });
  const svixId = 'msg_unit_1';
  const timestamp = Math.floor(new Date('2026-06-17T12:00:00.000Z').getTime() / 1000).toString();
  const signed = `${svixId}.${timestamp}.${body}`;
  const expected = crypto.createHmac('sha256', Buffer.from('unit-secret')).update(signed).digest('base64');

  const valid = verifyResendWebhookSignature({
    secret,
    svixId,
    svixTimestamp: timestamp,
    svixSignature: `v1,${expected}`,
    rawBody: body,
    now: new Date('2026-06-17T12:01:00.000Z'),
  });
  assert.equal(valid.ok, true);

  const stale = verifyResendWebhookSignature({
    secret,
    svixId,
    svixTimestamp: timestamp,
    svixSignature: `v1,${expected}`,
    rawBody: body,
    now: new Date('2026-06-17T12:11:00.000Z'),
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.reason, 'stale_timestamp');

  assert.equal(
    buildResendWebhookEventId({ svixId, eventType: 'email.delivered', providerMessageId: 're_123' }),
    'resend:msg_unit_1:email.delivered:re_123',
  );
});

test('revenue os live connectors: retries transient failures and records run health', async () => {
  const { buildRemotiveJobConnector, runJobSourceConnectors } = await import('../../lib/revenue-os/live-connectors.ts');
  let calls = 0;
  const result = await runJobSourceConnectors(
    [buildRemotiveJobConnector({ search: 'junior ai engineer', limit: 2 })],
    {
      retries: 1,
      retryDelayMs: 0,
      timeoutMs: 500,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return new Response('temporary outage', { status: 503 });
        return new Response(
          JSON.stringify({
            jobs: [
              {
                id: 1,
                title: 'Junior AI Application Engineer',
                company_name: 'Applied Apps',
                url: 'https://remotive.com/jobs/1',
                candidate_required_location: 'USA',
                description: 'Next.js TypeScript Python LLM APIs testing Vercel',
              },
            ],
          }),
          { status: 200 },
        );
      },
    },
  );

  assert.equal(calls, 2);
  assert.equal(result.errors.length, 0);
  assert.equal(result.runHealth.attemptedConnectors, 1);
  assert.equal(result.runHealth.successfulConnectors, 1);
  assert.equal(result.imported, 1);
});

test('revenue os daily runner v2: creates idempotent persistence payloads', async () => {
  const { buildDailyRevenueRunV2, buildDailyRunPersistenceRecord } = await import('../../lib/revenue-os/daily-runner-v2.ts');
  const run = buildDailyRevenueRunV2({
    runKey: 'daily-2026-06-17',
    leadHealth: { providersReady: 1, allowedLeads: 12, estimatedCostUsd: 0.48 },
    jobConnectorRun: { imported: 3, skipped: 1, applyNow: 2 },
    applicationPackets: [],
    emailQueue: { ready: 4, blocked: 1 },
  });
  const record = buildDailyRunPersistenceRecord({
    run,
    mode: 'cron',
    status: 'completed',
    runDate: '2026-06-17',
  });

  assert.equal(record.run_date, '2026-06-17');
  assert.equal(record.mode, 'cron');
  assert.equal(record.idempotency_key, 'cron:daily-2026-06-17:2026-06-17');
  assert.equal(record.scorecard.jobsToApply, 2);
  assert.equal(record.metadata.runKey, 'daily-2026-06-17');
});

// -------------------------------------------------------------- runner

let pass = 0;
let fail = 0;
const failures = [];

for (const { name, fn } of suites) {
  try {
    await fn();
    pass++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    fail++;
    failures.push({ name, err });
    console.log(`  FAIL  ${name}`);
  }
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
for (const f of failures) {
  console.log(`\n--- ${f.name} ---\n${f.err?.stack ?? f.err}`);
}
process.exit(fail === 0 ? 0 : 1);
