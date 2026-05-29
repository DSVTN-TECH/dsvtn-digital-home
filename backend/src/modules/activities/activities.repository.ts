import { Activity } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateActivityData = {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  createdById: string
}

export type UpdateActivityData = {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  status?: 'DRAFT' | 'OPEN' | 'CLOSED' | 'MATCHED' | 'COMPLETED'
}

export abstract class ActivitiesRepository extends BaseRepository<
  Activity,
  CreateActivityData,
  UpdateActivityData
> {
  abstract findByStatus(status?: Activity['status']): Promise<Activity[]>
}
