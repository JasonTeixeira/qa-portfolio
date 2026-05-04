// Sage Ideas Studio — Phase 13 productized offers (2026)
//
// 12 new SMB-friendly engagements across AI, automation, compliance,
// growth, and fractional leadership. All inquiry-first, all "from $X"
// floor pricing, all conform to ExtendedTier shape.

import type { ExtendedTier } from './extended'

const inquiryHref = (slug: string) => `/contact?engagement=${slug}`

// ─────────────────────────────────────────────────────────────────────────
// 1. RAG-as-a-Service (managed knowledge base agent)
// ─────────────────────────────────────────────────────────────────────────

const ragAsAService: ExtendedTier = {
  slug: 'rag-as-a-service',
  name: 'RAG-as-a-Service',
  shortName: 'RAG-as-a-Service',
  category: 'ai-services',
  tagline: 'Your docs, searchable by an agent that cites every answer.',
  description:
    'A fully managed retrieval-augmented agent over your knowledge base. We index your docs, build the retrieval pipeline, evaluate citation accuracy, and operate it month over month. Your team asks questions in Slack, the customer-facing widget, or your app — the agent answers with citations or admits it does not know.',
  price: 'from $1,800',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2–3 weeks setup',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('rag-as-a-service'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Pinecone', 'pgvector', 'OpenAI', 'Anthropic', 'LangChain', 'Re-rankers'],
  outcomes: [
    'Production RAG agent over your knowledge base',
    'Citation-grounded answers (every claim links back to source)',
    'Eval suite that catches retrieval drift',
    'Slack / widget / API endpoints ready to use',
    'Honest "I do not know" behavior on out-of-scope questions',
  ],
  deliverables: [
    'Indexed corpus (up to 50k pages) with chunking strategy tuned to content',
    'Retrieval pipeline with re-ranker + hybrid search (vector + BM25)',
    'Citation-formatted response template with source links',
    'Eval harness: 50+ Q&A pairs scored on accuracy + citation correctness',
    'Slack bot + JS widget + REST endpoint',
    '30 days of post-launch monitoring + tuning',
  ],
  notIncluded: [
    'Annotation labor at scale (we set up the loop; ongoing labeling is on you)',
    'Multi-tenant authorization layer (separate engagement)',
    'Translation of source docs (English-only by default)',
  ],
  faq: [
    {
      q: 'How big can the corpus be?',
      a: 'We index up to 50k pages in the base scope. Larger corpuses (100k+) add 1 week and are priced separately.',
    },
    {
      q: 'What is the ongoing cost?',
      a: 'Vector storage runs $20–$200/mo depending on volume. LLM inference depends on traffic — typical SMB: $40–$400/mo. You pay these directly (BYOK).',
    },
    {
      q: 'How accurate is it really?',
      a: 'On the eval suite we ship, expect 85–95% citation accuracy out of the gate. We tune to your domain in the 30-day post-launch window.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Index + retrieval', description: 'Ingest corpus, pick chunking strategy, build hybrid retrieval with re-ranker.', artifacts: ['Indexed corpus', 'Retrieval pipeline', 'Chunking spec'] },
    { label: 'Week 2', title: 'Agent + evals', description: 'Wire LLM answer-generation with strict citation format. Build 50+ eval cases. Tune until accuracy clears threshold.', artifacts: ['Agent prompt', 'Eval suite', 'Accuracy report'] },
    { label: 'Week 3', title: 'Surfaces + handoff', description: 'Ship Slack bot, JS widget, and REST endpoint. 30-day post-launch tuning included.', artifacts: ['Slack bot', 'JS widget', 'API endpoint', 'Runbook'] },
  ],
  resultMetrics: [
    { value: '85–95%', label: 'Citation accuracy', context: 'on eval suite' },
    { value: '<2s', label: 'Median response', context: 'p50 latency' },
    { value: '50k', label: 'Pages indexed', context: 'base scope' },
  ],
  addOns: [
    { name: 'Multi-language support', description: 'Add 2–3 languages with native-speaker eval review.', price: '+$1,200' },
    { name: 'Slack DM + thread mode', description: 'Agent participates in threads with conversational memory.', price: '+$800' },
    { name: 'Customer-facing widget skin', description: 'Branded chat widget with your colors, logo, and copy.', price: '+$600' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Managed RAG agent over a customer knowledge base, with eval-grounded citation accuracy and monitored production deployment.',
}

// ─────────────────────────────────────────────────────────────────────────
// 2. AI SDR Agent (outbound prospecting)
// ─────────────────────────────────────────────────────────────────────────

const aiSdrAgent: ExtendedTier = {
  slug: 'ai-sdr-agent',
  name: 'AI SDR Agent',
  shortName: 'AI SDR',
  category: 'ai-products',
  tagline: 'Outbound prospecting that researches before it writes.',
  description:
    'A pipeline that finds your ICP, researches each prospect with public-only signal, drafts a referenced first-touch + 2 follow-ups, and runs the whole thing through your approval queue before anything sends. Sister to AI Lead Engine but tuned for outbound. Your reviewer hits approve. Nothing else gets sent.',
  price: 'from $2,400',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-sdr-agent'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Apollo', 'Clay', 'OpenAI', 'Anthropic', 'Lemlist', 'Smartlead', 'HubSpot'],
  outcomes: [
    'Prospect list scoring tuned to your closed-won data',
    'Research-grounded outreach drafts (every claim linked to a public source)',
    '3-step sequence per prospect, all human-approved before send',
    'Reply triage that routes warm leads to humans',
    'Weekly performance dashboard',
  ],
  deliverables: [
    'ICP definition + scoring model',
    'Enrichment pipeline (Apollo / Clay / Custom)',
    'Research module that pulls from job posts, news, podcasts, GitHub',
    'Draft → approval queue → send flow with full audit log',
    'Reply classifier (hot / warm / not-now / unsubscribe)',
    'Send infrastructure (Lemlist / Smartlead / Instantly) wired in',
    '30 days of post-launch tuning',
  ],
  notIncluded: [
    'Cold-call automation (out of scope, TCPA risk)',
    'Buying contact data (you supply or we recommend providers)',
    'Ongoing list-building labor (one-time setup; ongoing is a retainer)',
  ],
  faq: [
    {
      q: 'How is this different from auto-spam tools?',
      a: 'Every send goes through your approval queue. The agent drafts; you click send. We measure approval rate, not send volume.',
    },
    {
      q: 'How do you handle deliverability?',
      a: 'Domain warmup, SPF/DKIM/DMARC setup, send-time pacing, and bounce suppression are all part of the build.',
    },
    {
      q: 'Will it sound like a robot?',
      a: 'The drafts are research-grounded — they reference something specific about the prospect (job change, recent post, hiring signal). If you would not be proud to send it, we tune the prompt.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'ICP + score model', description: 'Mine your closed-won, define ICP, build scoring model that matches your wins.', artifacts: ['ICP doc', 'Scoring model', 'Test cohort'] },
    { label: 'Week 2', title: 'Enrichment + research', description: 'Wire Apollo/Clay enrichment + research module that scrapes public signal sources.', artifacts: ['Enrichment pipeline', 'Research module', 'Sample profiles'] },
    { label: 'Week 3', title: 'Drafting + approval', description: 'Build draft generator + approval queue. Tune prompts until approval rate clears 70%.', artifacts: ['Draft generator', 'Approval UI', 'Prompt library'] },
    { label: 'Week 4', title: 'Send + reply routing', description: 'Wire send tools, build reply classifier, ship dashboard, hand off.', artifacts: ['Send pipeline', 'Reply classifier', 'Dashboard', 'Runbook'] },
  ],
  resultMetrics: [
    { value: '70%+', label: 'Draft approval rate', context: 'after tuning' },
    { value: '8–18%', label: 'Reply rate', context: 'on warm research' },
    { value: '100%', label: 'Human-approved sends', context: 'no auto-spam' },
  ],
  addOns: [
    { name: 'LinkedIn touch automation', description: 'Coordinated email + LinkedIn sequence with separate approval flow.', price: '+$1,200' },
    { name: 'Account-based targeting (50 accounts)', description: 'Deep research mode for a curated target list with custom angles.', price: '+$1,800' },
    { name: 'Multi-language outreach', description: 'Drafts + replies handled in 2–3 languages.', price: '+$900' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Outbound SDR agent that researches prospects from public signal, drafts referenced outreach, and routes every send through human approval.',
}

// ─────────────────────────────────────────────────────────────────────────
// 3. AI Customer Support Agent
// ─────────────────────────────────────────────────────────────────────────

const aiSupportAgent: ExtendedTier = {
  slug: 'ai-support-agent',
  name: 'AI Customer Support Agent',
  shortName: 'AI Support Agent',
  category: 'ai-products',
  tagline: 'Triages every ticket, drafts every reply, escalates the hard ones.',
  description:
    'A support agent wired into Intercom, Zendesk, Help Scout, or Freshdesk. It tags incoming tickets, drafts a first response grounded in your help center + past resolutions, escalates anything outside its confidence band, and learns from every reply your team sends. Cuts first-response time by 60–80% without firing your support team.',
  price: 'from $2,200',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-support-agent'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Intercom', 'Zendesk', 'Help Scout', 'Freshdesk', 'OpenAI', 'Anthropic'],
  outcomes: [
    'Auto-triage and tagging on every inbound ticket',
    'Draft replies for human review (or auto-send for low-risk categories)',
    'Confidence scoring with escalation when low',
    'Knowledge base coverage report (gaps surfaced weekly)',
    'CSAT-stable or better in production',
  ],
  deliverables: [
    'Ticket classifier (category + priority + sentiment)',
    'Draft generator grounded in your help center + past resolved tickets',
    'Confidence-based routing: auto-send / suggest / escalate',
    'Escalation rules (refunds, churn risk, legal, anything custom)',
    'Help-center gap detector (flags topics with no good source)',
    'Slack/email notification for escalations',
    '30 days of post-launch tuning',
  ],
  notIncluded: [
    'Manual ticket cleanup of historical backlog',
    'Translation of help docs (English-only by default)',
    'Phone support (use AI Voice Agent)',
  ],
  faq: [
    {
      q: 'Will it auto-send replies?',
      a: 'Only for categories you whitelist (password reset, shipping ETA, etc). Everything else drafts for human review.',
    },
    {
      q: 'What if our help docs are bad?',
      a: 'The agent will tell you which articles are stale, missing, or too short. Most clients use the gap report to fix their docs in the first month.',
    },
    {
      q: 'Will it handle refunds?',
      a: 'Refunds always escalate by default. You can configure a low-dollar auto-approve threshold ($25, $50) if you want.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Ingest + classify', description: 'Connect support tool, pull last 6 months of resolved tickets, train classifier.', artifacts: ['Classifier model', 'Tag taxonomy', 'Training data report'] },
    { label: 'Week 2', title: 'Draft + escalate', description: 'Build draft generator with help-center grounding. Configure escalation rules. Stand up shadow mode (drafts only).', artifacts: ['Draft generator', 'Escalation config', 'Shadow-mode results'] },
    { label: 'Week 3', title: 'Go-live + tune', description: 'Flip on draft-and-suggest. Monitor first 100 tickets together. Tune confidence thresholds.', artifacts: ['Production deploy', 'Tuning report', 'Runbook'] },
  ],
  resultMetrics: [
    { value: '60–80%', label: 'First-response time cut', context: 'typical' },
    { value: '90%+', label: 'Tag accuracy', context: 'after tuning' },
    { value: 'Stable', label: 'CSAT impact', context: 'or improved' },
  ],
  addOns: [
    { name: 'Multi-language support', description: 'Tag + draft in 2–3 additional languages.', price: '+$1,000' },
    { name: 'Voice-of-customer dashboard', description: 'Weekly synthesis of trending issues, feature requests, churn signals.', price: '+$600/mo' },
    { name: 'Auto-close low-risk', description: 'Automated resolution for password resets, shipping ETAs, account info.', price: '+$800' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Customer support agent for Intercom/Zendesk/Help Scout that triages, drafts, and escalates tickets with confidence-based routing.',
}

// ─────────────────────────────────────────────────────────────────────────
// 4. AI Internal Knowledge Bot (Slack/Teams Q&A)
// ─────────────────────────────────────────────────────────────────────────

const aiKnowledgeBot: ExtendedTier = {
  slug: 'ai-knowledge-bot',
  name: 'AI Internal Knowledge Bot',
  shortName: 'Knowledge Bot',
  category: 'ai-products',
  tagline: 'A Slack bot that knows your SOPs better than half your team does.',
  description:
    'An internal Q&A bot trained on your handbook, SOPs, runbooks, and Notion/Confluence. Drops into Slack or Teams. Answers with citations, says "I do not know" honestly, surfaces stale documents to admins. Stops the same five questions getting asked in #general every Monday.',
  price: 'from $1,400',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-knowledge-bot'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Slack', 'Teams', 'Notion', 'Confluence', 'Google Drive', 'OpenAI'],
  outcomes: [
    'One bot for all internal Q&A',
    'Cited answers with links back to source docs',
    'Stale-document detector (flags docs older than 90 days asked about often)',
    'Honest "I do not know" with link to ask a human',
    'Usage analytics so you know what your team is actually asking',
  ],
  deliverables: [
    'Index of Notion / Confluence / Google Drive / Slack threads',
    'Slack bot (slash command + @mention + DM)',
    'Teams app (optional)',
    'Source citation in every response',
    'Stale-doc dashboard for admins',
    'Daily/weekly digest of "questions asked"',
  ],
  notIncluded: [
    'Document re-writing (we surface gaps; rewriting is on you)',
    'External / customer-facing surfaces (use RAG-as-a-Service)',
    'Migration of docs to a new system',
  ],
  faq: [
    {
      q: 'How private is this?',
      a: 'BYOK on the LLM provider. Vector store runs in your cloud (or ours under DPA). Nothing leaves the workspace it was indexed from.',
    },
    {
      q: 'What about access permissions?',
      a: 'Permission-aware retrieval is in scope: the bot only surfaces docs the asking user can already access in Notion/Confluence/Drive.',
    },
    {
      q: 'How big can the doc set be?',
      a: 'Up to 25k pages in base scope. Larger sets (50k+) add 1 week and are priced separately.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Index + retrieval', description: 'Connect Notion/Confluence/Drive, set up permission-aware retrieval, validate on test queries.', artifacts: ['Indexed corpus', 'Retrieval pipeline', 'Permission map'] },
    { label: 'Week 2', title: 'Slack bot + go-live', description: 'Build Slack bot with slash command, @mention, DM. Stand up dashboard. 30-day tuning period.', artifacts: ['Slack bot', 'Admin dashboard', 'Runbook'] },
  ],
  resultMetrics: [
    { value: '<3s', label: 'Median response', context: 'in Slack' },
    { value: '25k', label: 'Pages indexed', context: 'base scope' },
    { value: '5–8 min', label: 'Per question saved', context: 'vs asking around' },
  ],
  addOns: [
    { name: 'Microsoft Teams app', description: 'Same bot, deployed as a Teams app with adaptive cards.', price: '+$700' },
    { name: 'Permission audit', description: 'Quarterly review that surfaces docs leaking outside intended audience.', price: '+$400/mo' },
    { name: 'Custom voice/persona', description: 'Bot personality tuned to your culture (formal, playful, deadpan).', price: '+$300' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Internal Slack/Teams Q&A bot indexed on company SOPs and handbook, with permission-aware retrieval and stale-doc detection.',
}

// ─────────────────────────────────────────────────────────────────────────
// 5. AI Meeting Notes + CRM Sync
// ─────────────────────────────────────────────────────────────────────────

const aiMeetingNotes: ExtendedTier = {
  slug: 'ai-meeting-notes-sync',
  name: 'AI Meeting Notes + CRM Sync',
  shortName: 'Meeting Notes Sync',
  category: 'automation-pipelines',
  tagline: 'Every call summarized, every action item assigned, every CRM field updated.',
  description:
    'A workflow that joins your calls (Zoom/Meet/Teams), generates structured summaries with timestamped action items, and writes the right fields back into HubSpot, Salesforce, Attio, or Pipedrive. Stop losing notes on Tuesdays. Stop rebuilding the deal-stage chronology by hand.',
  price: 'from $900',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-meeting-notes-sync'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Fireflies', 'Otter', 'Granola', 'HubSpot', 'Salesforce', 'Attio', 'Pipedrive', 'OpenAI'],
  outcomes: [
    'Structured call summary in your shared doc tool',
    'Action items extracted with owner + due date',
    'CRM fields updated (stage, next step, deal size, custom fields)',
    'Slack notification with the 3-line gist',
    'Searchable archive of every call',
  ],
  deliverables: [
    'Recording capture (Fireflies / Otter / Granola)',
    'Summary template tuned to your sales / CS / leadership cadence',
    'Action-item extractor with owner detection',
    'CRM write-back with field mapping',
    'Slack 3-line gist + link to full notes',
    'Searchable archive in Notion / Drive / Linear',
  ],
  notIncluded: [
    'Manual call recording cleanup',
    'Multi-language transcription (English-only base)',
    'Custom on-call scheduling (use Calendar Concierge)',
  ],
  faq: [
    {
      q: 'Which CRMs do you support?',
      a: 'HubSpot, Salesforce, Attio, Pipedrive, Close out of the box. Custom CRMs are in scope but add 3–5 days.',
    },
    {
      q: 'Will it record calls without consent?',
      a: 'No. Recording requires the same consent the underlying tool (Fireflies, Otter) requires. We do not bypass anything.',
    },
    {
      q: 'How accurate are the action items?',
      a: 'Tuned to your team in week 2. Typical: 90%+ correct extraction, 80%+ correct owner attribution.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Capture + summarize', description: 'Wire your recording tool, design summary template, tune extraction prompts.', artifacts: ['Capture pipeline', 'Summary template', 'Extraction prompts'] },
    { label: 'Week 2', title: 'CRM sync + go-live', description: 'Map fields to your CRM, build write-back, ship Slack notifier, monitor first 20 calls.', artifacts: ['Field map', 'Write-back pipeline', 'Slack integration', 'Runbook'] },
  ],
  resultMetrics: [
    { value: '90%+', label: 'Action extraction', context: 'after tuning' },
    { value: '<5 min', label: 'Summary delivery', context: 'after call ends' },
    { value: '4 hrs/wk', label: 'Saved per AE', context: 'typical' },
  ],
  addOns: [
    { name: 'Multi-language transcription', description: '2–3 languages with preserved structure.', price: '+$500' },
    { name: 'Coaching dashboard', description: 'Talk-to-listen ratio, monologue length, question rate per rep.', price: '+$400/mo' },
    { name: 'Deal-stage automation', description: 'Auto-advance deals on detected milestones (proposal sent, contract signed).', price: '+$700' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Pipeline that records, summarizes, extracts action items, and syncs structured fields back to the CRM after every call.',
}

// ─────────────────────────────────────────────────────────────────────────
// 6. SOC 2 Type 1 Readiness Sprint
// ─────────────────────────────────────────────────────────────────────────

const soc2Sprint: ExtendedTier = {
  slug: 'soc2-readiness-sprint',
  name: 'SOC 2 Type 1 Readiness Sprint',
  shortName: 'SOC 2 Readiness',
  category: 'compliance',
  tagline: 'Audit-ready in 6 weeks. Not 12 months.',
  description:
    'A compressed readiness sprint for SOC 2 Type 1. We pick a framework (Vanta / Drata / Secureframe), wire your stack into it, write the policies that actually match how you operate, close the gaps that block the audit, and prep your team for the auditor walk-through. You bring the auditor; we get you ready for them.',
  price: 'from $5,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '6 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('soc2-readiness-sprint'),
  capability: 'platform',
  mode: 'build',
  stackChips: ['Vanta', 'Drata', 'Secureframe', 'AWS', 'GitHub', 'Okta', 'Linear'],
  outcomes: [
    'Vanta / Drata / Secureframe fully wired',
    'Policy library written for your real ops (not stock templates)',
    'Gap remediation list closed',
    'Vendor inventory + DPA tracking',
    'Audit-ready evidence collection running',
  ],
  deliverables: [
    'Compliance platform setup (Vanta / Drata / Secureframe)',
    '12+ policies (info security, access control, vendor management, incident response, etc.) tailored to you',
    'Cloud control mapping (AWS / GCP / Azure config baselined)',
    'Identity + access review workflows',
    'Vendor inventory with DPAs collected',
    'Tabletop incident-response exercise',
    'Auditor pre-walkthrough rehearsal',
  ],
  notIncluded: [
    'Auditor fees (you contract directly with the audit firm)',
    'Type 2 evidence period (we get you to Type 1; Type 2 needs 6+ months observation)',
    'Penetration testing (we coordinate; vendor cost separate)',
  ],
  faq: [
    {
      q: 'Why Type 1 first?',
      a: 'Type 1 proves your controls are designed correctly. Type 2 proves they have been operating over 6+ months. You need Type 1 done before the Type 2 observation window starts.',
    },
    {
      q: 'Which platform should we pick?',
      a: 'Honest answer: any of the three works. We help you pick based on your stack — Vanta has the deepest integration library, Drata has the cleanest UX, Secureframe is the cheapest. We get a kickback from none of them.',
    },
    {
      q: 'How long until the actual SOC 2 report?',
      a: 'Type 1: 1–2 months after readiness completes. Type 2: 6–9 months after Type 1. We can roll into a compliance retainer to bridge that gap.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Scope + platform', description: 'Pick framework, scope your trust services criteria, deploy compliance platform.', artifacts: ['Scope doc', 'Platform deployed', 'Initial connections'] },
    { label: 'Week 2–3', title: 'Policies + controls', description: 'Write 12+ policies tuned to your ops. Baseline cloud controls. Map evidence sources.', artifacts: ['Policy library', 'Control baseline', 'Evidence map'] },
    { label: 'Week 4–5', title: 'Gap remediation', description: 'Close the gaps the platform flagged. Vendor inventory. Access reviews. Incident-response tabletop.', artifacts: ['Remediation log', 'Vendor inventory', 'Tabletop output'] },
    { label: 'Week 6', title: 'Pre-audit rehearsal', description: 'Mock auditor walk-through. Final evidence pass. You are ready to schedule the audit.', artifacts: ['Rehearsal report', 'Audit-ready checklist'] },
  ],
  resultMetrics: [
    { value: '6 weeks', label: 'To audit-ready', context: 'vs typical 6 months' },
    { value: '12+', label: 'Policies shipped', context: 'tuned to your ops' },
    { value: '100%', label: 'Trust criteria covered', context: 'Common Criteria + opt-in' },
  ],
  addOns: [
    { name: 'Penetration test coordination', description: 'We pick the vendor, scope the test, and triage findings. (Pen-test fee separate.)', price: '+$1,200' },
    { name: 'HIPAA add-on', description: 'Layer HIPAA controls on top of SOC 2 (BAAs, PHI handling, audit logs).', price: '+$2,400' },
    { name: 'Compliance retainer', description: 'Bridge to Type 2: monthly evidence reviews, vendor re-attestations, drift detection.', price: '+$1,200/mo' },
  ],
  caseStudySlugs: [],
  schemaSummary: '6-week SOC 2 Type 1 readiness sprint covering platform setup, policy authoring, control baselining, and pre-audit rehearsal.',
}

// ─────────────────────────────────────────────────────────────────────────
// 7. HIPAA Readiness Audit
// ─────────────────────────────────────────────────────────────────────────

const hipaaReadiness: ExtendedTier = {
  slug: 'hipaa-readiness-audit',
  name: 'HIPAA Readiness Audit',
  shortName: 'HIPAA Audit',
  category: 'compliance',
  tagline: 'Find out where you are non-compliant before a regulator does.',
  description:
    'A 3-week assessment covering the Security, Privacy, and Breach Notification rules. We map your data flows, audit your access controls, review your BAAs, identify PHI exposure points, and deliver a prioritized remediation plan with evidence templates. Done before you sign your first healthcare client.',
  price: 'from $4,200',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('hipaa-readiness-audit'),
  capability: 'platform',
  mode: 'audit',
  stackChips: ['AWS', 'GCP', 'Aptible', 'Datica', 'Okta', 'CloudTrail', 'Vanta'],
  outcomes: [
    'PHI data-flow map across your stack',
    'Access control + audit log review',
    'BAA inventory with gaps flagged',
    'Risk register prioritized by severity + likelihood',
    'Remediation plan with effort estimates',
  ],
  deliverables: [
    'Data-flow diagram showing every PHI touchpoint',
    'Access control review (who can see what, why, with audit trail)',
    'BAA inventory across all vendors that touch PHI',
    'Encryption-at-rest + in-transit verification',
    'Audit log coverage report',
    'Risk register (HHS-style) with severity + likelihood scoring',
    'Remediation plan with effort estimates and rough costs',
    'Loom walkthrough + 90-min review',
  ],
  notIncluded: [
    'Implementation of remediation (separate engagement)',
    'Workforce HIPAA training (we recommend providers)',
    'Formal HHS-side filings (you work with counsel for those)',
  ],
  faq: [
    {
      q: 'Are you a Covered Entity or Business Associate?',
      a: 'Sage Ideas is a Business Associate when handling PHI. We sign BAAs and operate under one with you for the engagement.',
    },
    {
      q: 'How is this different from SOC 2?',
      a: 'SOC 2 is auditor-attested controls across security/availability/confidentiality. HIPAA is regulatory and specifically covers PHI. They overlap ~60% but are not interchangeable.',
    },
    {
      q: 'What if we find serious gaps?',
      a: 'You get a remediation plan with rough costs and effort. You can hire us to ship the fixes or take it in-house. No pressure either way.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Data flow + scope', description: 'Map every place PHI lives, moves, or could leak. Identify covered systems.', artifacts: ['Data-flow diagram', 'System inventory', 'Scope doc'] },
    { label: 'Week 2', title: 'Controls audit', description: 'Access controls, audit logs, encryption, BAA inventory, vendor review.', artifacts: ['Access review', 'Audit-log report', 'BAA inventory', 'Encryption verification'] },
    { label: 'Week 3', title: 'Risk register + plan', description: 'Score every finding. Build remediation plan. 90-min review with leadership.', artifacts: ['Risk register', 'Remediation plan', 'Loom walkthrough', '90-min review'] },
  ],
  resultMetrics: [
    { value: '3 weeks', label: 'To full audit', context: 'fixed scope' },
    { value: 'HHS-style', label: 'Risk register', context: 'audit-format ready' },
    { value: '100%', label: 'PHI flow coverage', context: 'every touchpoint' },
  ],
  addOns: [
    { name: 'Remediation sprint', description: 'We ship the highest-severity fixes from the audit (3–6 week scope).', price: '+$3,500' },
    { name: 'Workforce training', description: 'Recorded HIPAA awareness training tuned to your team and stack.', price: '+$800' },
    { name: 'BAA template library', description: 'Reviewable BAA templates for vendor onboarding going forward.', price: '+$600' },
  ],
  caseStudySlugs: [],
  schemaSummary: '3-week HIPAA readiness audit covering Security, Privacy, and Breach Notification rules with a prioritized remediation plan.',
}

// ─────────────────────────────────────────────────────────────────────────
// 8. Stripe Integration Sprint
// ─────────────────────────────────────────────────────────────────────────

const stripeSprint: ExtendedTier = {
  slug: 'stripe-integration-sprint',
  name: 'Stripe Integration Sprint',
  shortName: 'Stripe Sprint',
  category: 'automation-pipelines',
  tagline: 'Production-grade billing in one week.',
  description:
    'A focused week to ship Stripe billing the right way. Subscriptions, one-time, metered, trials, proration, dunning, webhooks, customer portal, tax via Stripe Tax. Webhook idempotency that survives retries. Audit log of every charge. Done by someone who has built it 30 times.',
  price: 'from $1,800',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '1 week',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('stripe-integration-sprint'),
  capability: 'platform',
  mode: 'build',
  stackChips: ['Stripe', 'Stripe Tax', 'Stripe Connect', 'Next.js', 'Postgres', 'Webhooks'],
  outcomes: [
    'Subscriptions + one-time + metered billing live',
    'Customer Portal (self-serve plan changes, invoices, cancel)',
    'Webhook handler with idempotency + retry-safety',
    'Stripe Tax configured for your geography',
    'Audit log of every billing event',
  ],
  deliverables: [
    'Stripe products + prices (annual / monthly / metered as needed)',
    'Checkout flow (hosted or embedded, your choice)',
    'Subscription state synced to your DB with webhooks',
    'Customer Portal embedded',
    'Idempotent webhook handler with retry tolerance',
    'Stripe Tax setup',
    'Email receipts customized to your brand',
    'Loom walkthrough + 30-day Slack support',
  ],
  notIncluded: [
    'Multi-party Connect for marketplaces (separate engagement)',
    'Custom tax logic outside Stripe Tax',
    'Migration from another billing provider (scope separately)',
  ],
  faq: [
    {
      q: 'Which framework do you ship in?',
      a: 'Next.js + TypeScript + Postgres is the default. Other stacks (Rails, Django, Laravel) are in scope but add 1–2 days.',
    },
    {
      q: 'What about EU VAT / sales tax?',
      a: 'Stripe Tax handles it for most cases. We configure your jurisdictions and verify the tax-id collection flow.',
    },
    {
      q: 'Can you migrate us from Chargebee / Recurly?',
      a: 'Yes — that scopes separately because of the data migration. Typical: +1 week.',
    },
  ],
  phases: [
    { label: 'Day 1–2', title: 'Products + checkout', description: 'Stripe products, prices, checkout flow, Customer Portal.', artifacts: ['Products', 'Checkout flow', 'Portal embed'] },
    { label: 'Day 3–4', title: 'Webhooks + state sync', description: 'Idempotent webhook handler. Subscription state synced to DB. Retry-safe.', artifacts: ['Webhook handler', 'Migration script', 'Audit log'] },
    { label: 'Day 5', title: 'Tax + receipts + handoff', description: 'Stripe Tax config, branded receipts, Loom walkthrough, 30-day support.', artifacts: ['Tax config', 'Email templates', 'Loom', 'Slack channel'] },
  ],
  resultMetrics: [
    { value: '1 week', label: 'To live billing', context: 'fixed scope' },
    { value: '100%', label: 'Webhook idempotency', context: 'no double-charges' },
    { value: 'Zero', label: 'Manual tax math', context: 'Stripe Tax handles it' },
  ],
  addOns: [
    { name: 'Marketplace / Connect', description: 'Multi-party payouts, KYC onboarding, fee splits.', price: '+$2,800' },
    { name: 'Usage-based billing', description: 'Metered events with rate limits, overage alerts, budget caps.', price: '+$1,200' },
    { name: 'Migration from another billing tool', description: 'Move customers + subscriptions + history with zero gaps.', price: '+$2,400' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'One-week Stripe integration sprint: subscriptions, metered billing, customer portal, idempotent webhooks, and Stripe Tax.',
}

// ─────────────────────────────────────────────────────────────────────────
// 9. Auth + Billing Foundation
// ─────────────────────────────────────────────────────────────────────────

const authBillingFoundation: ExtendedTier = {
  slug: 'auth-billing-foundation',
  name: 'Auth + Billing Foundation',
  shortName: 'Auth + Billing',
  category: 'automation-pipelines',
  tagline: 'The boring 2 weeks every SaaS skips and regrets.',
  description:
    'The full auth + billing layer your app actually needs: signup, login, password reset, magic link, OAuth, multi-tenant orgs with roles, Stripe subscriptions, customer portal, audit log, admin impersonation. Done in 2 weeks instead of the 6 it takes when you build it yourself between feature work.',
  price: 'from $3,200',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('auth-billing-foundation'),
  capability: 'platform',
  mode: 'build',
  stackChips: ['Clerk', 'Auth.js', 'Supabase', 'Stripe', 'Next.js', 'Postgres', 'Resend'],
  outcomes: [
    'Auth: email + password, magic link, OAuth (Google/GitHub/etc.)',
    'Multi-tenant orgs with role-based access',
    'Stripe subscriptions + Customer Portal',
    'Audit log of every sensitive action',
    'Admin impersonation for support workflows',
  ],
  deliverables: [
    'Auth provider integrated (Clerk / Auth.js / Supabase Auth — your call)',
    'Org / workspace model with roles (owner / admin / member / billing-admin)',
    'Stripe billing wired to org subscriptions',
    'Customer Portal embedded',
    'Audit log table + writer for every sensitive action',
    'Admin impersonation flow with audit trail',
    'Email transactional templates (verification, reset, invite)',
    '30-day Slack support',
  ],
  notIncluded: [
    'SAML / SSO for enterprise customers (add-on)',
    'SCIM provisioning (add-on)',
    'Compliance certifications (use SOC 2 sprint)',
  ],
  faq: [
    {
      q: 'Which auth provider is best?',
      a: 'Honest pick depends on stage. Clerk: fastest to ship, costs scale with users. Auth.js: zero per-seat cost, more wiring. Supabase Auth: best if you are already on Supabase. We default to Clerk for B2B SaaS under 10k users.',
    },
    {
      q: 'Do you build it from scratch?',
      a: 'No. We use battle-tested providers and write only the glue. You get a 2-week build, not a 2-month one.',
    },
    {
      q: 'What if we already have auth?',
      a: 'We can layer billing + orgs + audit log on top of your existing auth. Scope shrinks to ~1 week.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Auth + orgs + roles', description: 'Wire auth provider, org/workspace model, role-based access, transactional emails.', artifacts: ['Auth flow', 'Org model', 'Role matrix', 'Email templates'] },
    { label: 'Week 2', title: 'Billing + audit + handoff', description: 'Stripe subscriptions per-org, Customer Portal, audit log, admin impersonation, Loom + 30-day support.', artifacts: ['Billing flow', 'Audit log', 'Impersonation', 'Loom', 'Slack channel'] },
  ],
  resultMetrics: [
    { value: '2 weeks', label: 'To production', context: 'vs 6+ DIY' },
    { value: '4 roles', label: 'Default permission tiers', context: 'plus custom' },
    { value: '100%', label: 'Sensitive actions audited', context: 'every write logged' },
  ],
  addOns: [
    { name: 'SAML / SSO', description: 'Enterprise SSO via WorkOS or Clerk Enterprise.', price: '+$1,800' },
    { name: 'SCIM provisioning', description: 'Auto-provision/deprovision users from IdP.', price: '+$1,400' },
    { name: 'API key management', description: 'Per-org API keys with scopes, rate limits, rotation.', price: '+$900' },
  ],
  caseStudySlugs: [],
  schemaSummary: '2-week build of multi-tenant auth, org/role model, Stripe billing, audit log, and admin impersonation for SaaS apps.',
}

// ─────────────────────────────────────────────────────────────────────────
// 10. Fractional CTO Retainer
// ─────────────────────────────────────────────────────────────────────────

const fractionalCto: ExtendedTier = {
  slug: 'fractional-cto-retainer',
  name: 'Fractional CTO Retainer',
  shortName: 'Fractional CTO',
  category: 'fractional',
  tagline: 'Seasoned technical leadership without the $300k headcount.',
  description:
    'A seasoned engineer-leader in your weekly leadership meeting, your architecture reviews, your hiring loop, and your investor calls. Two-day-a-week commitment. We help you make the bets, write the specs, set the bar, ship the right thing, and avoid the expensive wrong things. Cancel any month.',
  price: 'from $4,800/mo',
  priceCents: 480_000,
  cadence: 'monthly',
  timeline: 'Monthly · cancel any time',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('fractional-cto-retainer'),
  capability: 'strategy',
  mode: 'operate',
  stackChips: ['Architecture', 'Hiring', 'Roadmap', 'Vendor selection', 'Investor support'],
  outcomes: [
    'Weekly leadership presence',
    'Architecture decisions documented and signed off',
    'Hiring loop with rubric, take-home, and debrief',
    'Roadmap that survives contact with reality',
    'Vendor/build decisions made fast and cheap',
  ],
  deliverables: [
    '2 days/week (typical 16 hrs across the week, flexible)',
    'Weekly leadership meeting attendance',
    'Monthly architecture review with written ADR (architecture decision record)',
    'Hiring rubric + interview design + final-round attendance',
    'Quarterly roadmap planning + retro',
    'Investor / board technical talking points (when needed)',
    'Slack co-presence during business hours',
  ],
  notIncluded: [
    'Hands-on implementation (use the productized engagements for that)',
    '24/7 on-call (separate retainer)',
    'Fractional engineering — this is leadership, not capacity',
  ],
  faq: [
    {
      q: 'How is this different from an advisor?',
      a: 'Advisors give you 1 hour a month and equity. We give you 2 days a week, written ADRs, and skin in the game on the actual decisions.',
    },
    {
      q: 'Can we hire you full-time later?',
      a: 'Possible but unlikely — Sage Ideas is a studio. The retainer often bridges to a full-time hire we help you recruit.',
    },
    {
      q: 'What if we need more time some weeks?',
      a: 'Add hours at $250/hr. Flagship engagements at the studio rate are billed separately when in flight.',
    },
  ],
  phases: [
    { label: 'Month 1', title: 'Onboard + assess', description: 'Get up to speed on the product, team, and roadmap. Identify the 3 highest-leverage decisions to push on.', artifacts: ['Onboarding doc', 'Decision priority list', 'Stakeholder map'] },
    { label: 'Month 2+', title: 'Operate + lead', description: 'Weekly leadership meeting, monthly ADR, ongoing architecture and hiring support.', artifacts: ['Weekly notes', 'Monthly ADR', 'Quarterly retro'] },
  ],
  resultMetrics: [
    { value: '2 days/wk', label: 'Committed time', context: '~16 hrs' },
    { value: 'Monthly', label: 'Architecture ADRs', context: 'written + signed off' },
    { value: 'Cancel any month', label: 'No annual lock', context: 'sleep at night' },
  ],
  addOns: [
    { name: 'Hiring blitz', description: 'Run your eng hiring loop end-to-end for 8 weeks (sourcing → close).', price: '+$3,800/mo' },
    { name: 'Board / investor prep', description: 'Pre-board deck reviews, due-diligence Q&A coaching, technical references.', price: '+$1,200/mo' },
    { name: 'On-call rotation lead', description: 'Build + run on-call rotation, runbooks, post-incident discipline.', price: '+$1,800/mo' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Two-day-a-week fractional CTO retainer covering architecture, hiring, roadmap, and investor support.',
}

// ─────────────────────────────────────────────────────────────────────────
// 11. SEO Foundation Sprint
// ─────────────────────────────────────────────────────────────────────────

const seoFoundationSprint: ExtendedTier = {
  slug: 'seo-foundation-sprint',
  name: 'SEO Foundation Sprint',
  shortName: 'SEO Foundation',
  category: 'growth',
  tagline: 'The four-week SEO base every site should have shipped two years ago.',
  description:
    'Technical SEO done right. Site speed in the 90s, Core Web Vitals green, schema markup that earns rich results, sitemap discipline, internal linking that compounds, and a content brief framework you can run yourself. No "we will write 200 articles" — just the foundation that makes every future article rank.',
  price: 'from $2,400',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('seo-foundation-sprint'),
  capability: 'seo',
  mode: 'build',
  stackChips: ['Next.js', 'Schema.org', 'Search Console', 'Ahrefs', 'Lighthouse', 'GA4'],
  outcomes: [
    'Core Web Vitals green across templates',
    'Schema markup earning rich results in Search Console',
    'Crawl-budget cleanup (no junk URLs in the index)',
    'Internal linking architecture that compounds',
    'Content brief framework you can hand to a writer',
  ],
  deliverables: [
    'Technical audit (rendering, indexability, redirects, canonicals)',
    'Core Web Vitals fix sprint (LCP / INP / CLS)',
    'Schema markup library (Article, FAQ, HowTo, Product, BreadcrumbList)',
    'Sitemap + robots.txt + canonical strategy',
    'Internal linking map with priority pages',
    'Search Console + GA4 + Looker Studio dashboard',
    'Content brief template + 5 example briefs for your top topics',
  ],
  notIncluded: [
    'Content writing (this is foundation; writing is on you or a separate retainer)',
    'Off-page SEO / link building (we have ethical opinions; not in this scope)',
    'Local SEO (Google Business Profile etc.)',
  ],
  faq: [
    {
      q: 'How long until rankings move?',
      a: 'Honest answer: 8–16 weeks for indexed pages to re-rank, longer for new ones. Foundation work compounds — the value shows up in months 3–6.',
    },
    {
      q: 'Will you write content?',
      a: 'No. We deliver the brief framework + 5 examples. Writing is a separate engagement (Content Care Plus) or you hand off to your team.',
    },
    {
      q: 'What about programmatic SEO?',
      a: 'Add-on or follow-on engagement. Foundation has to be solid first or programmatic just amplifies whatever is broken.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Audit + crawl cleanup', description: 'Full technical audit, fix indexation issues, set up canonical / sitemap discipline.', artifacts: ['Technical audit', 'Crawl-cleanup PR', 'Indexation report'] },
    { label: 'Week 2', title: 'Core Web Vitals', description: 'Profile LCP/INP/CLS across templates. Ship fixes. Verify in field data.', artifacts: ['CWV report', 'Performance fixes', 'Field-data validation'] },
    { label: 'Week 3', title: 'Schema + linking', description: 'Implement schema markup library, internal linking architecture, structured-data validation.', artifacts: ['Schema library', 'Linking map', 'Rich-result eligibility'] },
    { label: 'Week 4', title: 'Briefs + dashboard', description: 'Build content brief framework + 5 examples. Ship Looker Studio dashboard. Loom walkthrough.', artifacts: ['Brief template', '5 example briefs', 'Dashboard', 'Loom'] },
  ],
  resultMetrics: [
    { value: '90+', label: 'Lighthouse perf', context: 'on critical templates' },
    { value: 'Green', label: 'Core Web Vitals', context: 'field + lab' },
    { value: '5', label: 'Schema types live', context: 'rich-result eligible' },
  ],
  addOns: [
    { name: 'Programmatic SEO build', description: 'AI-generated landing pages with governance, dedupe, and quality eval.', price: '+$3,200' },
    { name: 'SEO retainer', description: 'Monthly content briefs, link audit, ranking monitoring, technical drift detection.', price: '+$1,400/mo' },
    { name: 'Migration SEO', description: 'Pre-migration audit + redirect map + post-launch verification.', price: '+$1,600' },
  ],
  caseStudySlugs: [],
  schemaSummary: '4-week SEO foundation sprint covering technical audit, Core Web Vitals, schema markup, internal linking, and content brief framework.',
}

// ─────────────────────────────────────────────────────────────────────────
// 12. Churn Prediction Model
// ─────────────────────────────────────────────────────────────────────────

const churnPrediction: ExtendedTier = {
  slug: 'churn-prediction-model',
  name: 'Churn Prediction Model',
  shortName: 'Churn Prediction',
  category: 'ai-services',
  tagline: 'Know which customers are about to leave — while you can still save them.',
  description:
    'A churn-risk model trained on your usage data + billing data + support history. Scores every customer weekly, surfaces the top-N at-risk accounts to your CSM team, and explains the score so they know what to actually do about it. No black box — every prediction is explainable.',
  price: 'from $3,800',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('churn-prediction-model'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Python', 'XGBoost', 'SHAP', 'Snowflake', 'BigQuery', 'dbt', 'Looker'],
  outcomes: [
    'Weekly churn score for every active customer',
    'Top-N at-risk list delivered to CSM Slack channel',
    'Explanation per score (what is driving the risk)',
    'Save-play library matched to risk drivers',
    'Model performance dashboard (precision/recall over time)',
  ],
  deliverables: [
    'Feature pipeline (usage + billing + support + tenure)',
    'Trained model with hold-out evaluation',
    'SHAP-based explanations for every prediction',
    'Weekly scoring job',
    'Slack notifier with top-N at-risk accounts',
    'Save-play library mapped to top risk drivers',
    'Looker dashboard tracking model performance + save-play impact',
  ],
  notIncluded: [
    'CSM workflow design (we surface the risk; you decide the playbook)',
    'Real-time scoring (weekly is the default; daily / real-time is an add-on)',
    'Data warehouse setup (you must have one; if not, see Snowflake setup)',
  ],
  faq: [
    {
      q: 'How accurate is it?',
      a: 'Depends on signal quality. Typical: 75–88% precision on top-decile risk accounts. We benchmark against a 30-day hold-out before go-live.',
    },
    {
      q: 'How much data do we need?',
      a: 'Minimum: 12 months of customer data and at least 50 churn events. Less than that and the model overfits.',
    },
    {
      q: 'Will the CSM team trust it?',
      a: 'Yes — because every score has a SHAP explanation. They see what is driving the risk, not just a number.',
    },
  ],
  phases: [
    { label: 'Week 1', title: 'Feature engineering', description: 'Pull usage + billing + support, build feature pipeline, validate on training cohort.', artifacts: ['Feature pipeline', 'Feature dictionary', 'Training cohort'] },
    { label: 'Week 2', title: 'Train + validate', description: 'Train model, hold-out eval, calibration, baseline against simple rules.', artifacts: ['Trained model', 'Eval report', 'Baseline comparison'] },
    { label: 'Week 3', title: 'Explanations + scoring', description: 'Add SHAP explanations. Build weekly scoring job. Stand up Slack notifier.', artifacts: ['SHAP integration', 'Scoring job', 'Slack notifier'] },
    { label: 'Week 4', title: 'Save plays + dashboard', description: 'Map save plays to top risk drivers. Looker dashboard. Loom + 30-day support.', artifacts: ['Save-play library', 'Dashboard', 'Loom', 'Slack channel'] },
  ],
  resultMetrics: [
    { value: '75–88%', label: 'Top-decile precision', context: 'after tuning' },
    { value: 'Weekly', label: 'Scoring cadence', context: 'daily available' },
    { value: '100%', label: 'Predictions explained', context: 'SHAP-grounded' },
  ],
  addOns: [
    { name: 'Real-time scoring', description: 'Daily or event-driven scoring instead of weekly batch.', price: '+$1,800' },
    { name: 'Save-play attribution', description: 'Track which save plays actually saved which accounts. ROI per play.', price: '+$1,200' },
    { name: 'Expansion model', description: 'Sister model that scores expansion likelihood, not churn.', price: '+$2,400' },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Explainable churn prediction model with weekly scoring, SHAP explanations, and CSM-routed at-risk list.',
}

// ─────────────────────────────────────────────────────────────────────────
// Aggregate
// ─────────────────────────────────────────────────────────────────────────

export const phase13Offers: ExtendedTier[] = [
  ragAsAService,
  aiSdrAgent,
  aiSupportAgent,
  aiKnowledgeBot,
  aiMeetingNotes,
  soc2Sprint,
  hipaaReadiness,
  stripeSprint,
  authBillingFoundation,
  fractionalCto,
  seoFoundationSprint,
  churnPrediction,
]
