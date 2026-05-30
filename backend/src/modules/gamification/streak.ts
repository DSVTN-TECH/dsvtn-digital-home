export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date | null
}

function toUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function diffInDays(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY)
}

/**
 * Pure streak transition. Same-day activity is idempotent (no change).
 * Consecutive day increments the streak; a gap resets it to 1.
 */
export function nextStreak(state: StreakState, activityDate: Date): StreakState {
  const day = toUtcDate(activityDate)

  if (!state.lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, state.longestStreak),
      lastActivityDate: day,
    }
  }

  const gap = diffInDays(state.lastActivityDate, day)

  if (gap <= 0) {
    return state
  }

  const current = gap === 1 ? state.currentStreak + 1 : 1
  return {
    currentStreak: current,
    longestStreak: Math.max(current, state.longestStreak),
    lastActivityDate: day,
  }
}
