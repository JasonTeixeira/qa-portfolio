import Link from 'next/link'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './course00.module.css'

type Beat = {
  id: string
  glyph: string
  name: string
  tagline: string
  doing: string
  why: string
  whyName: string
}

const BEATS: Beat[] = [
  {
    id: 'hook',
    glyph: '01',
    name: 'Hook',
    tagline: 'A real problem before a single line of reading.',
    doing:
      'You meet a concrete scenario you actually care about, then take a short pretest — before you read anything. Getting it wrong on purpose is part of the design.',
    whyName: 'Retrieval + productive failure',
    why: 'Trying to answer before you know the material primes your brain to hold onto the explanation when it arrives. The struggle is what makes it stick — not a flaw to avoid.',
  },
  {
    id: 'model',
    glyph: '02',
    name: 'Model',
    tagline: 'See where it fits, then one worked example.',
    doing:
      'You orient to where the idea lives in the bigger picture, study a single fully worked example end to end, and take away the smallest concept you need — nothing padded.',
    whyName: 'Worked-example effect',
    why: 'Studying one complete, well-chosen example teaches faster than wading through theory. Concrete beats abstract when you are building the first mental model.',
  },
  {
    id: 'do',
    glyph: '03',
    name: 'Do',
    tagline: 'Recall it, build a tiny thing, then break it.',
    doing:
      'You pull the idea back from memory, build a small real artifact with it, and then handle the case where it breaks. Real code, in the browser, not a video you watch.',
    whyName: 'Generation + desirable difficulty',
    why: 'Generating an answer yourself — and wrestling with the hard edge case — cuts far deeper than recognizing a right answer on a slide. A little friction is the point.',
  },
  {
    id: 'prove',
    glyph: '04',
    name: 'Prove',
    tagline: 'Decide under a tradeoff, verify, teach it back, get scored, repair.',
    doing:
      'You make a real call where there is a tradeoff, verify your work, explain it back in your own words, get scored against a standard, and fix whatever was weak.',
    whyName: 'Feedback + deliberate practice',
    why: 'Specific feedback on a real decision — plus repairing the exact weakness it exposes — is how skill actually compounds. Explaining it back proves you own it.',
  },
  {
    id: 'lock',
    glyph: '05',
    name: 'Lock',
    tagline: 'Schedule review, transfer to a new context, package the proof, pass the gate.',
    doing:
      'You schedule the spaced review, apply the idea in a fresh context, package the proof of what you built, and pass an evidence gate to unlock what comes next.',
    whyName: 'Spacing + transfer',
    why: 'Spreading review over time and applying skills somewhere new is what moves them into durable, usable knowledge — not cramming you forget by next week.',
  },
]

/**
 * Course00 — the onboarding method primer.
 *
 * Teaches the 5-beat learning loop ITSELF on day one, so the learner forms the
 * right habit and expectation before their first real lesson. Each beat names
 * itself, says what you'll do, and explains why it works in plain language.
 * Restrained, institutional, token-styled. Honest: no fabricated progress.
 */
export function Course00() {
  return (
    <article className={styles.root} aria-labelledby="course00-title">
      <header className={styles.head}>
        <p className={styles.kicker}>The method · Course 00</p>
        <h2 id="course00-title" className={styles.title}>
          How every lesson here works
        </h2>
        <p className={styles.lede}>
          Every lesson on Sage Academy runs the same five beats, in the same order, every time.
          Same rhythm everywhere means you always know what is coming next — and that predictability
          is what turns it into a habit. Here is the whole loop before you start.
        </p>
        <ol className={styles.rail} aria-label="The five beats">
          {BEATS.map((beat) => (
            <li key={beat.id}>
              <a className={styles.railLink} href={`#beat-${beat.id}`}>
                <span className={styles.railNum} aria-hidden="true">
                  {beat.glyph}
                </span>
                {beat.name}
              </a>
            </li>
          ))}
        </ol>
      </header>

      <ol className={styles.beats}>
        {BEATS.map((beat) => (
          <li key={beat.id} id={`beat-${beat.id}`} className={styles.beat}>
            <div className={styles.beatMark} aria-hidden="true">
              <span className={styles.beatNum}>{beat.glyph}</span>
              <span className={styles.beatGlyphLabel}>{beat.name}</span>
            </div>
            <div className={styles.beatBody}>
              <h3 className={styles.beatName}>
                {beat.name}
                <span className={styles.beatTagline}>{beat.tagline}</span>
              </h3>
              <div className={styles.beatGrid}>
                <div className={styles.beatBlock}>
                  <p className={styles.blockLabel}>What you&rsquo;ll do</p>
                  <p className={styles.blockText}>{beat.doing}</p>
                </div>
                <div className={styles.beatBlock}>
                  <p className={styles.blockLabel}>
                    Why it works
                    <span className={styles.whyTag}>{beat.whyName}</span>
                  </p>
                  <p className={styles.blockText}>{beat.why}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <aside className={styles.gate} aria-label="How mastery is measured">
        <p className={styles.gateLabel}>The one rule that ties it together</p>
        <p className={styles.gateText}>
          Mastery here is <strong>evidence-gated</strong>. You reach 100 by{' '}
          <strong>proving</strong> — building, deciding, verifying, teaching it back — not by
          reading or clicking &ldquo;done.&rdquo; A lesson only completes when you pass its gate.
        </p>
      </aside>

      <footer className={styles.cta}>
        <Link className={styles.ctaButton} href="/academy/course/programming-fundamentals">
          Start with Programming Fundamentals
          <Icon name="arrow-right" size={17} />
        </Link>
        <p className={styles.ctaNote}>
          You&rsquo;ll see all five beats for real in your first lesson.
        </p>
      </footer>
    </article>
  )
}
