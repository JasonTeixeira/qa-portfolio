export type ArtifactType =
  | "Template"
  | "Checklist"
  | "Playbook"
  | "Example";

export type ArtifactCategory =
  | "Strategy"
  | "Planning"
  | "Execution"
  | "Reporting"
  | "Defect Management"
  | "Risk"
  | "Release"
  | "Automation"
  | "Security"
  | "Visual"
  | "API";

export interface QAArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  category: ArtifactCategory;
  description: string;
  format: "md" | "pdf" | "docx" | "txt";
  downloadPath: string;
  tags: string[];
  recommendedFor: ("Recruiters" | "Hiring Managers" | "Teams")[];
  lastUpdated: string; // YYYY-MM-DD
}

export const qaArtifacts: QAArtifact[] = [
  {
    id: "qa-1-page-playbook",
    title: "QA Playbook (1-page)",
    type: "Playbook",
    category: "Strategy",
    description:
      "A concise, recruiter-friendly overview of how I approach quality (risk, automation, CI, reporting).",
    format: "md",
    downloadPath: "/artifacts/playbooks/qa-1-page-playbook.md",
    tags: ["playbook", "overview"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-test-strategy-template",
    title: "Test Strategy (Template)",
    type: "Template",
    category: "Strategy",
    description:
      "A scalable, risk-based test strategy template you can adapt for teams, products, and platforms.",
    format: "md",
    downloadPath: "/artifacts/templates/test-strategy-template.md",
    tags: ["risk-based", "stakeholder-alignment", "coverage"],
    recommendedFor: ["Hiring Managers", "Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-test-plan-template",
    title: "Test Plan (Template)",
    type: "Template",
    category: "Planning",
    description:
      "A practical test plan template with scope, environments, entry/exit criteria, and reporting.",
    format: "md",
    downloadPath: "/artifacts/templates/test-plan-template.md",
    tags: ["planning", "scope", "entry-exit"],
    recommendedFor: ["Hiring Managers", "Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-risk-matrix",
    title: "Risk-Based Test Matrix (Template)",
    type: "Template",
    category: "Risk",
    description:
      "Risk scoring model + mapping from risk to test depth and automation priority.",
    format: "md",
    downloadPath: "/artifacts/templates/risk-based-test-matrix.md",
    tags: ["risk", "prioritization", "rbt"],
    recommendedFor: ["Hiring Managers", "Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-traceability-matrix",
    title: "Traceability Matrix (Template)",
    type: "Template",
    category: "Planning",
    description:
      "Requirements → test cases → automation coverage tracking with execution status.",
    format: "md",
    downloadPath: "/artifacts/templates/traceability-matrix.md",
    tags: ["traceability", "coverage", "requirements"],
    recommendedFor: ["Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-bug-report-template",
    title: "Bug Report Template (High Signal)",
    type: "Template",
    category: "Defect Management",
    description:
      "A bug report format optimized for fast triage and reproducibility (steps, expected, actual, evidence).",
    format: "md",
    downloadPath: "/artifacts/templates/bug-report-template.md",
    tags: ["triage", "repro", "evidence"],
    recommendedFor: ["Recruiters", "Hiring Managers", "Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-sample-bug-report",
    title: "Example: High-signal Bug Report (Filled)",
    type: "Example",
    category: "Defect Management",
    description:
      "A filled example showing the level of detail I aim for (evidence links, impact, environment, logs).",
    format: "md",
    downloadPath: "/artifacts/examples/sample-bug-report.md",
    tags: ["example", "bug-report"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-regression-checklist",
    title: "Regression Checklist (Template)",
    type: "Checklist",
    category: "Execution",
    description:
      "Reusable regression checklist structure (smoke + critical paths + data integrity + monitoring).",
    format: "md",
    downloadPath: "/artifacts/checklists/regression-checklist.md",
    tags: ["regression", "smoke", "critical-path"],
    recommendedFor: ["Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-api-testing-checklist",
    title: "API Testing Checklist",
    type: "Checklist",
    category: "API",
    description:
      "Coverage checklist for REST APIs: contracts, auth, rate limiting, negative tests, pagination, idempotency.",
    format: "md",
    downloadPath: "/artifacts/checklists/api-testing-checklist.md",
    tags: ["api", "contracts", "negative"],
    recommendedFor: ["Teams", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-security-testing-checklist",
    title: "Security Testing Checklist (OWASP-focused)",
    type: "Checklist",
    category: "Security",
    description:
      "Practical security coverage checklist aligned to OWASP Top 10 + API security basics.",
    format: "md",
    downloadPath: "/artifacts/checklists/security-testing-checklist.md",
    tags: ["security", "owasp", "api-security"],
    recommendedFor: ["Teams", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-visual-testing-checklist",
    title: "Visual Testing Checklist",
    type: "Checklist",
    category: "Visual",
    description:
      "Visual regression + responsive + cross-browser checklist, including strategies to reduce diff noise.",
    format: "md",
    downloadPath: "/artifacts/checklists/visual-testing-checklist.md",
    tags: ["visual", "responsive", "cross-browser"],
    recommendedFor: ["Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-flaky-test-triage-playbook",
    title: "Flaky Test Triage Playbook",
    type: "Playbook",
    category: "Automation",
    description:
      "A repeatable workflow for diagnosing and stabilizing flaky tests (signals, classification, fixes, prevention).",
    format: "md",
    downloadPath: "/artifacts/playbooks/flaky-test-triage-playbook.md",
    tags: ["flaky", "stability", "ci"],
    recommendedFor: ["Hiring Managers", "Teams"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-release-signoff-template",
    title: "Release Sign-off (Template)",
    type: "Template",
    category: "Release",
    description:
      "A release sign-off doc: risk summary, coverage summary, known issues, go/no-go criteria.",
    format: "md",
    downloadPath: "/artifacts/templates/release-signoff-template.md",
    tags: ["release", "go-no-go", "risk"],
    recommendedFor: ["Teams", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },  {
    id: "qa-test-strategy-filled",
    title: "Test Strategy (Filled Example)",
    type: "Example",
    category: "Strategy",
    description:
      "A fully filled strategy for a realistic retail/eCommerce app (scope, risks, coverage, CI gates).",
    format: "md",
    downloadPath: "/artifacts/filled/test-strategy-filled.md",
    tags: ["filled", "strategy", "realistic"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-test-plan-filled",
    title: "Test Plan (Filled Example)",
    type: "Example",
    category: "Planning",
    description:
      "A filled release test plan (scope, approach, data, entry/exit criteria, risks).",
    format: "md",
    downloadPath: "/artifacts/filled/test-plan-filled.md",
    tags: ["filled", "plan", "release"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-release-signoff-filled",
    title: "Release Sign-off (Filled Example)",
    type: "Example",
    category: "Release",
    description:
      "A filled sign-off: coverage summary, known issues, residual risk, and GO/NO-GO decision.",
    format: "md",
    downloadPath: "/artifacts/filled/release-signoff-filled.md",
    tags: ["filled", "signoff", "go-no-go"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },
  {
    id: "qa-recruiter-pack-zip",
    title: "Recruiter Pack (ZIP)",
    type: "Playbook",
    category: "Reporting",
    description:
      "One-click download: QA playbook + filled strategy/plan/signoff + sample bug report.",
    format: "txt",
    downloadPath: "/artifacts/recruiter-pack.zip",
    tags: ["recruiter-pack", "one-click", "proof"],
    recommendedFor: ["Recruiters", "Hiring Managers"],
    lastUpdated: "2026-01-03",
  },

];
