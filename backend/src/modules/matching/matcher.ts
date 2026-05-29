export interface MatcherTask {
  id: string
  slotCount: number
  priority: number
}

export interface MatcherPreference {
  taskId: string
  score: number
}

export interface MatcherRegistration {
  userId: string
  fairnessScore: number
  submittedAt: Date
  preferences: MatcherPreference[]
}

export interface MatcherInput {
  tasks: MatcherTask[]
  registrations: MatcherRegistration[]
}

export interface MatcherAssignment {
  userId: string
  taskId: string
  source: 'MATCHER'
}

export interface UnfilledTask {
  taskId: string
  remainingSlots: number
}

export interface MatcherResult {
  assignments: MatcherAssignment[]
  waitlist: string[]
  unfilledTasks: UnfilledTask[]
}

function sortRegistrations(registrations: MatcherRegistration[]): MatcherRegistration[] {
  return [...registrations].sort((a, b) => {
    if (a.fairnessScore !== b.fairnessScore) return a.fairnessScore - b.fairnessScore
    const ta = a.submittedAt.getTime()
    const tb = b.submittedAt.getTime()
    if (ta !== tb) return ta - tb
    return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0
  })
}

function sortPreferences(
  preferences: MatcherPreference[],
  taskById: Map<string, MatcherTask>,
): MatcherPreference[] {
  return [...preferences].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    const pa = taskById.get(a.taskId)?.priority ?? 0
    const pb = taskById.get(b.taskId)?.priority ?? 0
    if (pa !== pb) return pb - pa
    return a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0
  })
}

export function runGreedyMatcher(input: MatcherInput): MatcherResult {
  const taskById = new Map(input.tasks.map((t) => [t.id, t]))
  const remaining = new Map(input.tasks.map((t) => [t.id, t.slotCount]))

  const assignments: MatcherAssignment[] = []
  const waitlist: string[] = []

  const sortedRegs = sortRegistrations(input.registrations)

  for (const reg of sortedRegs) {
    const prefs = sortPreferences(reg.preferences, taskById)
    let assigned = false

    for (const pref of prefs) {
      if (pref.score <= 0) continue
      const slotsLeft = remaining.get(pref.taskId)
      if (slotsLeft === undefined || slotsLeft <= 0) continue

      assignments.push({ userId: reg.userId, taskId: pref.taskId, source: 'MATCHER' })
      remaining.set(pref.taskId, slotsLeft - 1)
      assigned = true
      break
    }

    if (!assigned) {
      waitlist.push(reg.userId)
    }
  }

  const unfilledTasks: UnfilledTask[] = input.tasks
    .filter((t) => (remaining.get(t.id) ?? 0) > 0)
    .map((t) => ({ taskId: t.id, remainingSlots: remaining.get(t.id) ?? 0 }))

  return { assignments, waitlist, unfilledTasks }
}
