export type EvidenceType = "Report" | "Screenshot";

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  // If imagePath is provided, the UI will render an inline preview image.
  imagePath?: string;
  // Optional links to prove where it came from.
  links: { label: string; url: string }[];
  lastUpdated: string; // YYYY-MM-DD
}

export const evidenceItems: EvidenceItem[] = [
  {
    id: "waf-rate-limit",
    title: "WAF Rate Limiting Evidence (429)",
    type: "Report",
    description:
      "Evidence capture showing WAF rate limiting in action (attack simulation triggers non-200 responses and subsequent 429).",
    links: [
      {
        label: "Evidence: waf-rate-limit.txt",
        url: "/artifacts/evidence/waf-rate-limit.txt",
      },
      {
        label: "Attack simulation script",
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/scripts/waf-attack-sim.mjs",
      },
      {
        label: "Terraform: CloudFront + WAF",
        url: "https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-api-edge",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "incident-drill-report",
    title: "Incident Drill Report (postmortem-style)",
    type: "Report",
    description:
      "Recruiter-friendly incident drill write-up showing operational mindset: detect → triage → mitigate → verify → follow-ups.",
    links: [
      {
        label: "Incident drill report",
        url: "/artifacts/evidence/incident-drill-report.md",
      },
      {
        label: "Incident triage playbook",
        url: "/artifacts/playbooks/incident-triage-playbook.md",
      },
      {
        label: "Ops readiness doc",
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/OPS_READINESS_DASHBOARD.md",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "aws-cloudwatch-dashboard",
    title: "AWS CloudWatch Dashboard (qa-portfolio-prod-api)",
    type: "Report",
    description:
      "Exported CloudWatch dashboard JSON showing Lambda errors/invocations, p95 duration, and API Gateway access-log query widgets.",
    links: [
      {
        label: "CloudWatch dashboard (AWS console)",
        url: "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=qa-portfolio-prod-api",
      },
      {
        label: "Terraform (aws-api)",
        url: "https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-api",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "aws-cloudwatch-alarms",
    title: "AWS CloudWatch Alarms (Lambda errors + duration p95)",
    type: "Report",
    description:
      "Alarm configuration export proving operational monitoring: errors alarm + p95 duration alarm.",
    links: [
      {
        label: "Alarms (AWS console)",
        url: "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:",
      },
      {
        label: "Terraform (alarms)",
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/infra/aws-api/main.tf",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "aws-apigw-routes",
    title: "AWS API Gateway Routes (prod)",
    type: "Report",
    description:
      "API Gateway route listing export showing /metrics/latest is deployed and reachable (token-protected).",
    links: [
      {
        label: "Proxy endpoint", 
        url: "https://api.sageideas.dev/metrics/latest",
      },
      {
        label: "Terraform route resource", 
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/infra/aws-api/main.tf",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "aws-s3-latest-head-object",
    title: "AWS S3 Object Metadata (latest.json)",
    type: "Report",
    description:
      "S3 head-object output proving encryption, size, versioning, and retention for the latest metrics snapshot.",
    links: [
      {
        label: "S3 bucket (Terraform)",
        url: "https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-quality-telemetry",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "aws-iam-github-oidc-role",
    title: "AWS IAM Role Trust Policy (GitHub OIDC writer)",
    type: "Report",
    description:
      "IAM role export proving GitHub Actions uses OIDC federation (no long-lived AWS keys) for writing metrics.",
    links: [
      {
        label: "Terraform (OIDC + role)",
        url: "https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-quality-telemetry",
      },
    ],
    lastUpdated: "2026-01-18",
  },
  {
    id: "playwright-report",
    title: "Playwright UI Report (HTML)",
    type: "Report",
    description:
      "Screenshot from a UI smoke run showing the kind of output I use for debugging (screenshots, traces, failures).",
    imagePath: "/artifacts/evidence/playwright-report.svg",
    links: [
      {
        label: "Portfolio repo",
        url: "https://github.com/JasonTeixeira/qa-portfolio",
      },
      {
        label: "Portfolio CI runs",
        url: "https://github.com/JasonTeixeira/qa-portfolio/actions",
      },
    ],
    lastUpdated: "2026-01-03",
  },
  {
    id: "allure-report",
    title: "Allure Report (BDD)",
    type: "Report",
    description:
      "Allure evidence-first reporting from the BDD framework (attachments on failure).",
    imagePath: "/artifacts/evidence/allure-report.svg",
    links: [
      {
        label: "BDD framework repo",
        url: "https://github.com/JasonTeixeira/BDD-Cucumber-Framework",
      },
      {
        label: "BDD CI runs",
        url: "https://github.com/JasonTeixeira/BDD-Cucumber-Framework/actions/workflows/bdd.yml",
      },
    ],
    lastUpdated: "2026-01-03",
  },
  {
    id: "lighthouse-ci",
    title: "Lighthouse CI Results", 
    type: "Report",
    description:
      "Lighthouse CI report output for key pages (performance, a11y, best practices, SEO).",
    imagePath: "/artifacts/evidence/lighthouse-ci.svg",
    links: [
      {
        label: "Lighthouse config (portfolio)",
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/lighthouserc.json",
      },
      {
        label: "Quality snapshot workflow",
        url: "https://github.com/JasonTeixeira/qa-portfolio/blob/main/.github/workflows/quality-snapshot.yml",
      },
    ],
    lastUpdated: "2026-01-03",
  },
  {
    id: "security-scan",
    title: "Security Scan Output", 
    type: "Report",
    description:
      "Security scan output example (secrets + OWASP checks) used as evidence in the security suite.",
    imagePath: "/artifacts/evidence/security-scan.svg",
    links: [
      {
        label: "Security Testing Suite",
        url: "/projects/security-testing-suite",
      },
    ],
    lastUpdated: "2026-01-03",
  },
];
