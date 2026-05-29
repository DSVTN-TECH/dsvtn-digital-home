import type { MemberAssignment, MemberAssignmentsDataSource } from './assignments.datasource'

const mockAssignments: MemberAssignment[] = [
  {
    id: 'mock-assign-1',
    activityId: '00000000-0000-0000-0000-000000000001',
    taskId: 'mock-task-1',
    userId: 'mock-user',
    source: 'MATCHER',
    status: 'PROPOSED',
    createdAt: new Date().toISOString(),
  },
]

export class MockMemberAssignmentsDataSource implements MemberAssignmentsDataSource {
  async listMyAssignments(activityId: string): Promise<MemberAssignment[]> {
    return Promise.resolve(mockAssignments.filter((a) => a.activityId === activityId))
  }
}
