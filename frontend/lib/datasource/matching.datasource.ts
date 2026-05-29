export interface MatcherAssignment {
  userId: string
  taskId: string
  source: 'MATCHER' | 'MANUAL'
}

export interface UnfilledTask {
  taskId: string
  remainingSlots: number
}

export interface MatcherRunResult {
  activityId: string
  assignments: MatcherAssignment[]
  waitlist: string[]
  unfilledTasks: UnfilledTask[]
}

export interface SavedAssignment {
  id: string
  activityId: string
  taskId: string
  userId: string
  source: 'MATCHER' | 'MANUAL'
  status: string
  createdAt: string
}

export interface MatchingDataSource {
  run(activityId: string): Promise<MatcherRunResult>
  listAssignments(activityId: string): Promise<SavedAssignment[]>
}
