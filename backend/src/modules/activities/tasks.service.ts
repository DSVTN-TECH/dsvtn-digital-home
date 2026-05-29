import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ACTIVITIES_REPOSITORY, TASKS_REPOSITORY } from '../../common/repository'
import { ActivitiesRepository } from './activities.repository'
import { TasksRepository } from './tasks.repository'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY) private readonly tasks: TasksRepository,
    @Inject(ACTIVITIES_REPOSITORY) private readonly activities: ActivitiesRepository,
  ) {}

  async listForActivity(activityId: string) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    return this.tasks.findByActivity(activityId)
  }

  async create(activityId: string, dto: CreateTaskDto) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    return this.tasks.create({
      activityId,
      name: dto.name,
      description: dto.description,
      slotCount: dto.slotCount,
      priority: dto.priority,
    })
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.tasks.findById(id)
    if (!existing) throw new NotFoundException('Task not found')
    return this.tasks.update(id, {
      name: dto.name,
      description: dto.description,
      slotCount: dto.slotCount,
      priority: dto.priority,
    })
  }
}
