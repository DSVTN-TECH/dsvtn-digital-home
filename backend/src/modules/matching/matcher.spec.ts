import { MatcherInput, runGreedyMatcher } from './matcher'

const d = (iso: string) => new Date(iso)

describe('runGreedyMatcher', () => {
  it('assigns top preference when slot available', () => {
    const input: MatcherInput = {
      tasks: [{ id: 't1', slotCount: 2, priority: 0 }],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([{ userId: 'u1', taskId: 't1', source: 'MATCHER' }])
    expect(result.waitlist).toEqual([])
  })

  it('falls to next preference when top is full', () => {
    const input: MatcherInput = {
      tasks: [
        { id: 't1', slotCount: 1, priority: 0 },
        { id: 't2', slotCount: 1, priority: 0 },
      ],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
        {
          userId: 'u2',
          fairnessScore: 0,
          submittedAt: d('2026-01-02'),
          preferences: [
            { taskId: 't1', score: 3 },
            { taskId: 't2', score: 2 },
          ],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toContainEqual({ userId: 'u1', taskId: 't1', source: 'MATCHER' })
    expect(result.assignments).toContainEqual({ userId: 'u2', taskId: 't2', source: 'MATCHER' })
  })

  it('tie-breaks by fairness then submittedAt', () => {
    const input: MatcherInput = {
      tasks: [{ id: 't1', slotCount: 1, priority: 0 }],
      registrations: [
        {
          userId: 'u2',
          fairnessScore: 2,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-05'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([{ userId: 'u1', taskId: 't1', source: 'MATCHER' }])
    expect(result.waitlist).toEqual(['u2'])
  })

  it('tie-breaks by userId when fairness and submittedAt equal', () => {
    const input: MatcherInput = {
      tasks: [{ id: 't1', slotCount: 1, priority: 0 }],
      registrations: [
        {
          userId: 'uB',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
        {
          userId: 'uA',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([{ userId: 'uA', taskId: 't1', source: 'MATCHER' }])
    expect(result.waitlist).toEqual(['uB'])
  })

  it('does not assign to task with 0 slots', () => {
    const input: MatcherInput = {
      tasks: [{ id: 't1', slotCount: 0, priority: 0 }],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([])
    expect(result.waitlist).toEqual(['u1'])
  })

  it('waitlists users with no positive preference', () => {
    const input: MatcherInput = {
      tasks: [{ id: 't1', slotCount: 2, priority: 0 }],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 0 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([])
    expect(result.waitlist).toEqual(['u1'])
  })

  it('never exceeds slotCount and reports unfilled', () => {
    const input: MatcherInput = {
      tasks: [
        { id: 't1', slotCount: 1, priority: 0 },
        { id: 't2', slotCount: 3, priority: 0 },
      ],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
        {
          userId: 'u2',
          fairnessScore: 0,
          submittedAt: d('2026-01-02'),
          preferences: [{ taskId: 't1', score: 3 }],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    const t1Count = result.assignments.filter((a) => a.taskId === 't1').length
    expect(t1Count).toBe(1)
    expect(result.waitlist).toEqual(['u2'])
    expect(result.unfilledTasks).toContainEqual({ taskId: 't2', remainingSlots: 3 })
  })

  it('respects priority desc on equal score', () => {
    const input: MatcherInput = {
      tasks: [
        { id: 't1', slotCount: 1, priority: 1 },
        { id: 't2', slotCount: 1, priority: 5 },
      ],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 0,
          submittedAt: d('2026-01-01'),
          preferences: [
            { taskId: 't1', score: 2 },
            { taskId: 't2', score: 2 },
          ],
        },
      ],
    }
    const result = runGreedyMatcher(input)
    expect(result.assignments).toEqual([{ userId: 'u1', taskId: 't2', source: 'MATCHER' }])
  })

  it('is deterministic for same input run twice', () => {
    const input: MatcherInput = {
      tasks: [
        { id: 't1', slotCount: 1, priority: 0 },
        { id: 't2', slotCount: 1, priority: 0 },
      ],
      registrations: [
        {
          userId: 'u1',
          fairnessScore: 1,
          submittedAt: d('2026-01-02'),
          preferences: [
            { taskId: 't1', score: 3 },
            { taskId: 't2', score: 2 },
          ],
        },
        {
          userId: 'u2',
          fairnessScore: 1,
          submittedAt: d('2026-01-02'),
          preferences: [
            { taskId: 't1', score: 3 },
            { taskId: 't2', score: 2 },
          ],
        },
      ],
    }
    const r1 = runGreedyMatcher(input)
    const r2 = runGreedyMatcher(input)
    expect(r1).toEqual(r2)
  })
})
