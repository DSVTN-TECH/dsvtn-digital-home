import type { MatchingDataSource, MatcherRunResult, SavedAssignment } from './matching.datasource'

let lastRun: MatcherRunResult | null = null

export class MockMatchingDataSource implements MatchingDataSource {
  async run(activityId: string): Promise<MatcherRunResult> {
    lastRun = {
      activityId,
      assignments: [
        { userId: 'mock-user-1', taskId: 'mock-task-1', source: 'MATCHER' },
        { userId: 'mock-user-2', taskId: 'mock-task-1', source: 'MATCHER' },
      ],
      waitlist: ['mock-user-3'],
      unfilledTasks: [{ taskId: 'mock-task-2', remainingSlots: 1 }],
    }
    return Promise.resolve(lastRun)
  }

  async listAssignments(activityId: string): Promise<SavedAssignment[]> {
    const runResult = lastRun
    if (!runResult || runResult.activityId !== activityId) return Promise.resolve([])
    return Promise.resolve(
      runResult.assignments.map((a, i) => ({
        id: `mock-assign-${i}`,
        activityId,
        taskId: a.taskId,
        userId: a.userId,
        source: a.source,
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
      })),
    )
  }
}
