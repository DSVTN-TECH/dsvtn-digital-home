import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { ActivitiesRepository } from './activities.repository'
import { TasksRepository } from './tasks.repository'
import { RegistrationsRepository } from './registrations.repository'
import { CreateRegistrationDto } from './dto/create-registration.dto'

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(REGISTRATIONS_REPOSITORY) private readonly registrations: RegistrationsRepository,
    @Inject(ACTIVITIES_REPOSITORY) private readonly activities: ActivitiesRepository,
    @Inject(TASKS_REPOSITORY) private readonly tasks: TasksRepository,
  ) {}

  async submit(activityId: string, userId: string, dto: CreateRegistrationDto) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    if (activity.status !== 'OPEN') {
      throw new UnprocessableEntityException('Activity is not open for registration')
    }

    const existing = await this.registrations.findByActivityAndUser(activityId, userId)
    if (existing) {
      throw new ConflictException('You already registered for this activity')
    }

    const activityTasks = await this.tasks.findByActivity(activityId)
    const taskIds = new Set(activityTasks.map((t) => t.id))
    for (const pref of dto.preferences) {
      if (!taskIds.has(pref.taskId)) {
        throw new UnprocessableEntityException(
          `Task ${pref.taskId} does not belong to this activity`,
        )
      }
    }

    return this.registrations.create({
      activityId,
      userId,
      preferences: dto.preferences,
    })
  }

  async listByActivity(activityId: string) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    return this.registrations.findByActivity(activityId)
  }
}
