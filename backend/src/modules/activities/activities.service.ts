import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Activity } from '@prisma/client'
import { ACTIVITIES_REPOSITORY } from '../../common/repository'
import { ActivitiesRepository } from './activities.repository'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

type ActivityStatus = Activity['status']

const ALLOWED_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  DRAFT: ['OPEN'],
  OPEN: ['CLOSED'],
  CLOSED: ['MATCHED', 'OPEN'],
  MATCHED: ['COMPLETED'],
  COMPLETED: [],
}

export function isAllowedTransition(from: ActivityStatus, to: ActivityStatus): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from].includes(to)
}

@Injectable()
export class ActivitiesService {
  constructor(@Inject(ACTIVITIES_REPOSITORY) private readonly repo: ActivitiesRepository) {}

  async findAllAdmin(status?: ActivityStatus) {
    return this.repo.findByStatus(status)
  }

  async findOpenForMember() {
    return this.repo.findByStatus('OPEN')
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.repo.findById(id)
    if (!activity) throw new NotFoundException('Activity not found')
    return activity
  }

  async create(dto: CreateActivityDto, createdById: string) {
    const start = new Date(dto.startTime)
    const end = new Date(dto.endTime)
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime')
    }
    return this.repo.create({
      title: dto.title,
      description: dto.description,
      startTime: start,
      endTime: end,
      createdById,
    })
  }

  async update(id: string, dto: UpdateActivityDto) {
    const existing = await this.findOne(id)

    if (dto.status && !isAllowedTransition(existing.status, dto.status)) {
      throw new UnprocessableEntityException(
        `Cannot transition from ${existing.status} to ${dto.status}`,
      )
    }

    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime')
    }

    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      startTime: dto.startTime ? start : undefined,
      endTime: dto.endTime ? end : undefined,
      status: dto.status,
    })
  }
}
