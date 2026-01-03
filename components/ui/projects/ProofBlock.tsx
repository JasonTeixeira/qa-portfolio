import Image from "next/image";
import { ExternalLink, GitBranch, FileText, Video } from "lucide-react";

export interface ProofLinks {
  ciBadgeUrl?: string;
  ciRunsUrl?: string;
  reportUrl?: string;
  demoVideoUrl?: string;
}

export default function ProofBlock({ proof }: { proof: ProofLinks }) {
  const { ciBadgeUrl, ciRunsUrl, reportUrl, demoVideoUrl } = proof;

  if (!ciBadgeUrl && !ciRunsUrl && !reportUrl && !demoVideoUrl) return null;

  return (
    <div className="mb-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-foreground">Proof</h3>
        {ciBadgeUrl && ciRunsUrl && (
          <a
            href={ciRunsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
            aria-label="View CI runs"
          >
            <Image src={ciBadgeUrl} alt="CI status" width={140} height={20} className="h-5 w-auto" />
          </a>
        )}
        {ciBadgeUrl && !ciRunsUrl && (
          <Image src={ciBadgeUrl} alt="CI status" width={140} height={20} className="h-5 w-auto" />
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {ciRunsUrl && (
          <a
            href={ciRunsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors"
          >
            <GitBranch size={18} />
            <span>CI Runs</span>
            <ExternalLink size={16} className="opacity-70" />
          </a>
        )}

        {reportUrl && (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors"
          >
            <FileText size={18} />
            <span>Latest Report</span>
            <ExternalLink size={16} className="opacity-70" />
          </a>
        )}

        {demoVideoUrl && (
          <a
            href={demoVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors"
          >
            <Video size={18} />
            <span>Demo Video</span>
            <ExternalLink size={16} className="opacity-70" />
          </a>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Recruiter note: this section is intentionally “evidence-first” (builds, runs, reports).
      </p>
    </div>
  );
}
