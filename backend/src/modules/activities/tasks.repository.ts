import { Task } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateTaskData = {
  activityId: string
  name: string
  description?: string
  slotCount: number
  priority?: number
}

export type UpdateTaskData = {
  name?: string
  description?: string
  slotCount?: number
  priority?: number
}

export abstract class TasksRepository extends BaseRepository<Task, CreateTaskData, UpdateTaskData> {
  abstract findByActivity(activityId: string): Promise<Task[]>
}
