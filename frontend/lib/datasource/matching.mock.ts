import type { MatchingDataSource, MatcherRunResult, SavedAssignment } from './matching.datasource'

const primaryActivityId = '00000000-0000-0000-0000-000000000001'

let lastRun: MatcherRunResult | null = {
  activityId: primaryActivityId,
  assignments: [
    { userId: 'mock-user-1', taskId: 'mock-task-1', source: 'MATCHER' },
    { userId: 'mock-user-2', taskId: 'mock-task-1', source: 'MATCHER' },
    { userId: 'mock-user-3', taskId: 'mock-task-2', source: 'MATCHER' },
  ],
  waitlist: ['mock-user-4'],
  unfilledTasks: [
    { taskId: 'mock-task-1', remainingSlots: 3 },
    { taskId: 'mock-task-2', remainingSlots: 3 },
    { taskId: 'mock-task-3', remainingSlots: 3 },
  ],
}
let savedAssignments: SavedAssignment[] = [
  {
    id: 'mock-assign-1',
    activityId: primaryActivityId,
    taskId: 'mock-task-1',
    userId: 'mock-user-1',
    source: 'MATCHER',
    status: 'PROPOSED',
    createdAt: '2026-05-20T08:00:00.000Z',
  },
  {
    id: 'mock-assign-2',
    activityId: primaryActivityId,
    taskId: 'mock-task-1',
    userId: 'mock-user-2',
    source: 'MATCHER',
    status: 'CONFIRMED',
    createdAt: '2026-05-20T08:05:00.000Z',
  },
  {
    id: 'mock-assign-3',
    activityId: primaryActivityId,
    taskId: 'mock-task-2',
    userId: 'mock-user-3',
    source: 'MANUAL',
    status: 'PROPOSED',
    createdAt: '2026-05-20T08:10:00.000Z',
  },
]

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
