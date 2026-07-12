import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const SITE = 'https://www.sageideas.dev';

export const metadata: Metadata = {
  title: 'Sage Ideas Discord — approval-gated builder community',
  description: 'Apply to the Sage Ideas Discord: a lean, approval-gated community for builders learning AI apps, websites, automation, cloud, content systems, and growth by shipping useful work.',
  alternates: { canonical: `${SITE}/discord` },
  openGraph: {
    title: 'Sage Ideas Discord',
    description: 'An approval-gated builder community with real questions, reviews, learning loops, and public proof.',
    images: ['/images/hero-lab.jpg'],
  },
};

const loops = [
  ['Question', 'Ask with context: goal, blocker, current attempt, artifact.'],
  ['Review', 'Get critique that makes the build stronger, not vague encouragement.'],
  ['Resource', 'Approved answers become reusable checklists, prompts, and lessons.'],
  ['Proof', 'Wins and lessons become anonymized public recaps after approval.'],
];

const paths = ['AI apps', 'Websites', 'Agents and automation', 'Cloud systems', 'Content engines', 'Growth systems'];

export default function DiscordLandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa]">
      <section className="relative min-h-[88vh] overflow-hidden border-b border-[#27272a]">
        <Image
          src="/images/hero-lab.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[#09090b]/70" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-28 sm:px-8 lg:pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#67e8f9]">Approval-gated Discord</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Sage Ideas Discord
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#d4d4d8] sm:text-lg">
            A lean builder community for people learning AI apps, websites, automation, cloud, content engines, and growth systems by shipping useful work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/academy?utm_source=discord_landing&utm_medium=site&utm_campaign=discord_public_proof"
              className="inline-flex h-11 items-center rounded-md bg-[#22d3ee] px-5 text-sm font-semibold text-[#031316] transition hover:bg-[#67e8f9]"
            >
              Apply to join
            </Link>
            <a
              href="#quality"
              className="inline-flex h-11 items-center rounded-md border border-[#3f3f46] bg-[#111116]/80 px-5 text-sm font-semibold text-[#fafafa] transition hover:border-[#67e8f9]"
            >
              Read the quality bar
            </a>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Signal label="Approval" value="manual review" />
            <Signal label="Structure" value="lean channels" />
            <Signal label="Loop" value="question -> resource -> proof" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#67e8f9]">Who It Is For</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Builders who want a workroom, not another noisy server.</h2>
          <p className="mt-4 text-sm leading-7 text-[#a1a1aa]">
            The server is intentionally approval-gated. New members answer a short application, accept the rules, and wait for manual approval before they see member channels.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {paths.map((path) => (
            <div key={path} className="rounded-lg border border-[#27272a] bg-[#111116] p-4 text-sm font-medium text-[#e4e4e7]">
              {path}
            </div>
          ))}
        </div>
      </section>

      <section id="quality" className="border-y border-[#27272a] bg-[#0f0f12]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#67e8f9]">Quality Bar</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {loops.map(([label, body]) => (
              <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090b] p-5">
                <h3 className="text-base font-semibold text-[#fafafa]">{label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#a1a1aa]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#67e8f9]">How Approval Works</p>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-[#d4d4d8]">
              <li>1. Read the quality bar and apply with your goal, level, and current build.</li>
              <li>2. Wait for manual approval. Unapproved members only see the start area.</li>
              <li>3. After approval, choose your path and level so SageBot can route your next step.</li>
              <li>4. Participate through questions, build updates, reviews, challenges, and wins.</li>
            </ol>
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#111116] p-5">
            <h3 className="text-base font-semibold">Premium is optional.</h3>
            <p className="mt-3 text-sm leading-7 text-[#a1a1aa]">
              Premium adds priority project review, deeper RAG-backed answers, office-hours queue priority, premium resources, and accountability tracking. Basic participation remains free after approval.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#27272a] bg-[#111116]/90 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#71717a]">{label}</div>
      <div className="mt-2 text-sm font-semibold text-[#fafafa]">{value}</div>
    </div>
  );
}
