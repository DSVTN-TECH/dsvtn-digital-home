import { nextStreak } from './streak'

describe('nextStreak', () => {
  it('starts a new streak when there is no previous activity', () => {
    const result = nextStreak(
      { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      new Date('2026-05-10T12:00:00.000Z'),
    )
    expect(result).toMatchObject({ currentStreak: 1, longestStreak: 1 })
    expect(result.lastActivityDate?.toISOString()).toBe('2026-05-10T00:00:00.000Z')
  })

  it('is idempotent for same-day activity', () => {
    const state = {
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: new Date('2026-05-10T00:00:00.000Z'),
    }
    expect(nextStreak(state, new Date('2026-05-10T18:00:00.000Z'))).toBe(state)
  })

  it('increments for consecutive days', () => {
    const result = nextStreak(
      { currentStreak: 3, longestStreak: 3, lastActivityDate: new Date('2026-05-10') },
      new Date('2026-05-11'),
    )
    expect(result.currentStreak).toBe(4)
    expect(result.longestStreak).toBe(4)
  })

  it('resets after a gap', () => {
    const result = nextStreak(
      { currentStreak: 3, longestStreak: 7, lastActivityDate: new Date('2026-05-10') },
      new Date('2026-05-15'),
    )
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(7)
  })
})
