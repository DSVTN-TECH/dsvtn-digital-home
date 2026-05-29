import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { AssignmentStatus } from '@prisma/client'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { ActivitiesRepository } from '../activities/activities.repository'
import { TasksRepository } from '../activities/tasks.repository'
import { RegistrationsRepository } from '../activities/registrations.repository'
import { AssignmentsRepository } from './assignments.repository'
import { runGreedyMatcher, MatcherResult } from './matcher'

const ASSIGNMENTS_REPOSITORY = Symbol('ASSIGNMENTS_REPOSITORY')
export { ASSIGNMENTS_REPOSITORY }

@Injectable()
export class MatchingService {
  constructor(
    @Inject(ACTIVITIES_REPOSITORY) private readonly activities: ActivitiesRepository,
    @Inject(TASKS_REPOSITORY) private readonly tasks: TasksRepository,
    @Inject(REGISTRATIONS_REPOSITORY) private readonly registrations: RegistrationsRepository,
    @Inject(ASSIGNMENTS_REPOSITORY) private readonly assignments: AssignmentsRepository,
  ) {}

  async runMatcher(activityId: string): Promise<MatcherResult & { activityId: string }> {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    if (activity.status === 'MATCHED') {
      throw new ConflictException('Matcher already ran for this activity')
    }
    if (activity.status !== 'CLOSED') {
      throw new UnprocessableEntityException('Activity must be CLOSED to run matcher')
    }

    const tasks = await this.tasks.findByActivity(activityId)
    const regs = await this.registrations.findByActivity(activityId)

    const input = {
      tasks: tasks.map((t) => ({ id: t.id, slotCount: t.slotCount, priority: t.priority })),
      registrations: regs.map((r) => ({
        userId: r.userId,
        fairnessScore: 0,
        submittedAt: r.submittedAt,
        preferences: r.preferences.map((p) => ({ taskId: p.taskId, score: p.score })),
      })),
    }

    const result = runGreedyMatcher(input)

    await this.assignments.deleteByActivity(activityId)
    if (result.assignments.length > 0) {
      await this.assignments.createMany(
        result.assignments.map((a) => ({
          activityId,
          taskId: a.taskId,
          userId: a.userId,
          source: 'MATCHER' as const,
        })),
      )
    }

    await this.activities.update(activityId, { status: 'MATCHED' })

    return { activityId, ...result }
  }

  async getAssignments(activityId: string) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    return this.assignments.findByActivity(activityId)
  }

  async getMyAssignments(activityId: string, userId: string) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    return this.assignments.findByActivityAndUser(activityId, userId)
  }

  async overrideAssignment(
    id: string,
    dto: { userId?: string; taskId?: string; status?: AssignmentStatus },
  ) {
    const assignment = await this.assignments.findById(id)
    if (!assignment) throw new NotFoundException('Assignment not found')

    const nextTaskId = dto.taskId ?? assignment.taskId
    const nextUserId = dto.userId ?? assignment.userId

    if (dto.taskId) {
      const task = await this.tasks.findById(dto.taskId)
      if (!task || task.activityId !== assignment.activityId) {
        throw new UnprocessableEntityException('Task does not belong to assignment activity')
      }

      const usedSlots = await this.assignments.countByTask(dto.taskId, assignment.id)
      if (usedSlots >= task.slotCount) {
        throw new UnprocessableEntityException('Task has no available slot')
      }
    }

    if (dto.userId) {
      const conflict = await this.assignments.findUserConflict(
        assignment.activityId,
        dto.userId,
        assignment.id,
      )
      if (conflict) {
        throw new ConflictException('User already has assignment in this activity')
      }
    }

    return this.assignments.updateManual(id, {
      taskId: nextTaskId,
      userId: nextUserId,
      status: dto.status,
    })
  }
}
