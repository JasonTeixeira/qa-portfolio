import { CheckCircle2, XCircle, ExternalLink, Terminal, ShieldCheck, Gauge, Accessibility, FlaskConical } from "lucide-react";
import type { Project } from "@/lib/projectsData";

function Gate({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <CheckCircle2 size={16} className="text-green-400" />
      ) : (
        <XCircle size={16} className="text-gray-500" />
      )}
      <span className={enabled ? "text-gray-200" : "text-gray-500"}>{label}</span>
    </div>
  );
}

export default function ProjectQualityGates({ project }: { project: Project }) {
  const hasCI = Boolean(project.proof?.ciRunsUrl || project.proof?.ciBadgeUrl);
  const hasReport = Boolean(project.proof?.reportUrl);

  // This is an opinionated “platform engineer” default: we show the gates you typically enforce.
  // We can later make this project-specific by adding a `qualityGates` object to Project data.
  const gates = {
    "CI pipeline": hasCI,
    "Test report artifact": hasReport,
    "E2E tests": project.category.includes("E2E") || project.tags.some((t) => /playwright|selenium|e2e/i.test(t)),
    "API tests": project.category.includes("API") || project.tags.some((t) => /api|pydantic|requests/i.test(t)),
    "Performance checks": project.category.includes("Performance") || project.tags.some((t) => /lighthouse|locust|jmeter/i.test(t)),
    "Security checks": project.category.includes("Security") || project.tags.some((t) => /owasp|security/i.test(t)),
    "Accessibility checks": project.tags.some((t) => /axe|a11y|accessibility/i.test(t)),
  };

  // Simple “how to run” helpers. These can be overridden later per project.
  const runSteps = [
    project.github ? `git clone ${project.github}` : null,
    "# See repo README for setup",
    "# Typical patterns:",
    "# - npm test / npm run test",
    "# - pytest -q",
    "# - make test",
  ].filter(Boolean) as string[];

  return (
    <section className="my-10">
      <div className="bg-dark-card border border-dark-lighter rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Quality Gates</h2>
            <p className="text-gray-300 text-sm mt-2 max-w-2xl">
              This project is presented like a production system: measurable, reproducible, and backed by evidence.
              (Next step: make these gates fully project-specific and auto-fed into the Quality Dashboard.)
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.proof?.ciRunsUrl && (
              <a
                href={project.proof.ciRunsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-dark-lighter rounded-lg hover:border-primary transition-colors"
              >
                <ExternalLink size={16} className="text-primary" />
                <span className="text-gray-200">CI runs</span>
              </a>
            )}
            {project.proof?.reportUrl && (
              <a
                href={project.proof.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-semibold"
              >
                <ExternalLink size={16} />
                <span>Report</span>
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Gate label="CI pipeline" enabled={gates["CI pipeline"]} />
          <Gate label="Test report artifact" enabled={gates["Test report artifact"]} />
          <div className="flex items-center gap-2 text-sm">
            <FlaskConical size={16} className="text-primary" />
            <Gate label="API tests" enabled={gates["API tests"]} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Terminal size={16} className="text-primary" />
            <Gate label="E2E tests" enabled={gates["E2E tests"]} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge size={16} className="text-primary" />
            <Gate label="Performance checks" enabled={gates["Performance checks"]} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="text-primary" />
            <Gate label="Security checks" enabled={gates["Security checks"]} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Accessibility size={16} className="text-primary" />
            <Gate label="Accessibility checks" enabled={gates["Accessibility checks"]} />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-200 font-semibold mb-3">
            <Terminal size={16} className="text-primary" />
            <span>Run locally</span>
          </div>
          <pre className="bg-dark-lighter border border-dark-lighter rounded-lg p-4 overflow-x-auto text-xs text-gray-200">
{runSteps.join("\n")}
          </pre>
        </div>
      </div>
    </section>
  );
}
