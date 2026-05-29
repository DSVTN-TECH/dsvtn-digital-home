import { Assignment } from '@prisma/client'

export type CreateAssignmentData = {
  activityId: string
  taskId: string
  userId: string
  source: 'MATCHER' | 'MANUAL'
}

export abstract class AssignmentsRepository {
  abstract findByActivity(activityId: string): Promise<Assignment[]>
  abstract findByActivityAndUser(activityId: string, userId: string): Promise<Assignment[]>
  abstract createMany(data: CreateAssignmentData[]): Promise<number>
  abstract deleteByActivity(activityId: string): Promise<number>
}
