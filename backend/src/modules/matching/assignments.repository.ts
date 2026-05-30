import { Assignment, AssignmentStatus } from '@prisma/client'

export type CreateAssignmentData = {
  activityId: string
  taskId: string
  userId: string
  source: 'MATCHER' | 'MANUAL'
}

export abstract class AssignmentsRepository {
  abstract findById(id: string): Promise<Assignment | null>
  abstract findByActivity(activityId: string): Promise<Assignment[]>
  abstract findByActivityAndUser(activityId: string, userId: string): Promise<Assignment[]>
  abstract countByTask(taskId: string, excludeAssignmentId?: string): Promise<number>
  abstract findUserConflict(
    activityId: string,
    userId: string,
    excludeAssignmentId: string,
  ): Promise<Assignment | null>
  abstract createMany(data: CreateAssignmentData[]): Promise<number>
  abstract updateManual(
    id: string,
    data: { userId?: string; taskId?: string; status?: AssignmentStatus },
  ): Promise<Assignment>
  abstract completeActivityAssignments(activityId: string): Promise<Assignment[]>
  abstract deleteByActivity(activityId: string): Promise<number>
}
