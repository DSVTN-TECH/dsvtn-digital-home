import type { MatchingDataSource, MatcherRunResult, SavedAssignment } from './matching.datasource'

let lastRun: MatcherRunResult | null = null
let savedAssignments: SavedAssignment[] = []

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
    savedAssignments = lastRun.assignments.map((a, i) => ({
      id: `mock-assign-${i}`,
      activityId,
      taskId: a.taskId,
      userId: a.userId,
      source: a.source,
      status: 'PROPOSED',
      createdAt: new Date().toISOString(),
    }))
    return Promise.resolve(lastRun)
  }

  async listAssignments(activityId: string): Promise<SavedAssignment[]> {
    return Promise.resolve(
      savedAssignments.filter((assignment) => assignment.activityId === activityId),
    )
  }

  async overrideAssignment(
    id: string,
    input: { userId?: string; taskId?: string; status?: string },
  ): Promise<SavedAssignment> {
    const index = savedAssignments.findIndex((assignment) => assignment.id === id)
    if (index < 0) throw new Error('Không tìm thấy assignment')
    const updated = {
      ...savedAssignments[index],
      userId: input.userId || savedAssignments[index].userId,
      taskId: input.taskId || savedAssignments[index].taskId,
      status: input.status || savedAssignments[index].status,
      source: 'MANUAL' as const,
    }
    savedAssignments[index] = updated
    return Promise.resolve(updated)
  }
}
