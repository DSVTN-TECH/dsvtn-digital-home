export interface MemberAssignment {
  id: string
  activityId: string
  taskId: string
  userId: string
  source: 'MATCHER' | 'MANUAL'
  status: 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export interface MemberAssignmentsDataSource {
  listMyAssignments(activityId: string): Promise<MemberAssignment[]>
}
