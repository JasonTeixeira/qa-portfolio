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
