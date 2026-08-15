/**
 * Pure goal logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (getLearnerGoal, getLearnerStats) lives in goals.ts and
 * imports from here so the tested logic IS the prod logic.
 *
 * A learner picks ONE goal (the commitment device). Each goal is a sequence of
 * PLATFORM-ENGAGEMENT milestones (not specific course content) that escalate,
 * so "progress toward your goal" stays meaningful regardless of catalog changes.
 */

/** The stat snapshot every milestone check is evaluated against. */
export interface GoalStats {
  lessonsCompleted: number
  coursesFinished: number
  certificates: number
  projects: number
  currentStreak: number
  startedAnyLesson: boolean
}

export interface Milestone {
  key: string
  label: string
  /** Deterministic check against the learner's stats. */
  done: (s: GoalStats) => boolean
}

export interface Goal {
  key: string
  label: string
  blurb: string
  milestones: Milestone[]
}

/** A milestone with its computed completion state (the shape the UI consumes). */
export interface MilestoneProgress {
  key: string
  label: string
  done: boolean
}

export interface GoalProgress {
  goalKey: string
  label: string
  pct: number
  milestones: MilestoneProgress[]
  nextMilestone: { key: string; label: string } | null
  doneCount: number
  total: number
}

// ── reusable milestone definitions ───────────────────────────────────────────
// Keyed + escalating. Goals compose a 6–8 long ORDERED subset of these.
const M = {
  startLesson: {
    key: 'start-lesson',
    label: 'Start your first lesson',
    done: (s: GoalStats) => s.startedAnyLesson || s.lessonsCompleted >= 1,
  },
  finishLesson: {
    key: 'finish-lesson',
    label: 'Finish your first lesson',
    done: (s: GoalStats) => s.lessonsCompleted >= 1,
  },
  fiveLessons: {
    key: 'five-lessons',
    label: 'Finish 5 lessons',
    done: (s: GoalStats) => s.lessonsCompleted >= 5,
  },
  streak3: {
    key: 'streak-3',
    label: 'Keep a 3-day streak',
    done: (s: GoalStats) => s.currentStreak >= 3,
  },
  streak7: {
    key: 'streak-7',
    label: 'Reach a 7-day streak',
    done: (s: GoalStats) => s.currentStreak >= 7,
  },
  finishCourse: {
    key: 'finish-course',
    label: 'Finish your first course',
    done: (s: GoalStats) => s.coursesFinished >= 1,
  },
  threeCourses: {
    key: 'three-courses',
    label: 'Finish 3 courses',
    done: (s: GoalStats) => s.coursesFinished >= 3,
  },
  firstCert: {
    key: 'first-cert',
    label: 'Earn your first certificate',
    done: (s: GoalStats) => s.certificates >= 1,
  },
  threeCerts: {
    key: 'three-certs',
    label: 'Earn 3 certificates',
    done: (s: GoalStats) => s.certificates >= 3,
  },
  firstProject: {
    key: 'first-project',
    label: 'Ship a portfolio project',
    done: (s: GoalStats) => s.projects >= 1,
  },
  threeProjects: {
    key: 'three-projects',
    label: 'Ship 3 portfolio projects',
    done: (s: GoalStats) => s.projects >= 3,
  },
} as const satisfies Record<string, Milestone>

/**
 * The goals a learner can pick, in display order. Content-agnostic: each is a
 * different escalation path through the same engagement milestones.
 */
export const GOAL_CATALOG: readonly Goal[] = [
  {
    key: 'job-ready',
    label: 'Become job-ready',
    blurb: 'Build the streak, the courses, and the proof a hiring manager wants to see.',
    milestones: [
      M.finishLesson,
      M.streak3,
      M.finishCourse,
      M.firstCert,
      M.firstProject,
      M.threeCourses,
      M.threeCerts,
      M.streak7,
    ],
  },
  {
    key: 'first-app',
    label: 'Ship my first real app',
    blurb: 'Learn just enough, then put a real project in your portfolio.',
    milestones: [
      M.startLesson,
      M.finishLesson,
      M.streak3,
      M.finishCourse,
      M.firstProject,
      M.firstCert,
      M.threeProjects,
    ],
  },
  {
    key: 'fundamentals',
    label: 'Master the fundamentals',
    blurb: 'Go deep and earn the certificates that prove you know your stuff.',
    milestones: [
      M.finishLesson,
      M.fiveLessons,
      M.streak3,
      M.finishCourse,
      M.firstCert,
      M.threeCourses,
      M.threeCerts,
    ],
  },
  {
    key: 'explore',
    label: 'Explore & build a habit',
    blurb: 'No pressure — show up, build the streak, and see where it takes you.',
    milestones: [
      M.startLesson,
      M.finishLesson,
      M.streak3,
      M.fiveLessons,
      M.firstCert,
      M.streak7,
    ],
  },
]

const DEFAULT_GOAL = GOAL_CATALOG[3] // 'explore' — the lowest-pressure fallback.

/** Look up a goal by key, falling back to the default for unknown keys. */
export function getGoal(goalKey: string): Goal {
  return GOAL_CATALOG.find((g) => g.key === goalKey) ?? DEFAULT_GOAL
}

/**
 * Deterministic progress toward a goal. pct = doneCount / total * 100 (rounded).
 * nextMilestone is the first not-yet-done milestone in order (null when complete).
 */
export function computeGoalProgress(goalKey: string, stats: GoalStats): GoalProgress {
  const goal = getGoal(goalKey)
  const milestones: MilestoneProgress[] = goal.milestones.map((m) => ({
    key: m.key,
    label: m.label,
    done: m.done(stats),
  }))
  const doneCount = milestones.filter((m) => m.done).length
  const total = milestones.length
  const next = milestones.find((m) => !m.done) ?? null
  return {
    goalKey: goal.key,
    label: goal.label,
    pct: total ? Math.round((doneCount / total) * 100) : 0,
    milestones,
    nextMilestone: next ? { key: next.key, label: next.label } : null,
    doneCount,
    total,
  }
}
