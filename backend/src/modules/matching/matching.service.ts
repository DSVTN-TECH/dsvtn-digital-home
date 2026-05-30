import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { AssignmentStatus } from '@prisma/client'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { DomainEvents } from '../../common/events/domain-events'
import { LockService } from '../../common/lock'
import { ActivitiesRepository } from '../activities/activities.repository'
import { TasksRepository } from '../activities/tasks.repository'
import { RegistrationsRepository } from '../activities/registrations.repository'
import { AssignmentsRepository } from './assignments.repository'
import { runGreedyMatcher, MatcherResult } from './matcher'

const ASSIGNMENTS_REPOSITORY = Symbol('ASSIGNMENTS_REPOSITORY')
export { ASSIGNMENTS_REPOSITORY }

const MATCHER_LOCK_TTL_SECONDS = 120

@Injectable()
export class MatchingService {
  constructor(
    @Inject(ACTIVITIES_REPOSITORY) private readonly activities: ActivitiesRepository,
    @Inject(TASKS_REPOSITORY) private readonly tasks: TasksRepository,
    @Inject(REGISTRATIONS_REPOSITORY) private readonly registrations: RegistrationsRepository,
    @Inject(ASSIGNMENTS_REPOSITORY) private readonly assignments: AssignmentsRepository,
    private readonly lock: LockService,
    private readonly events: EventEmitter2,
  ) {}

  async runMatcher(activityId: string): Promise<MatcherResult & { activityId: string }> {
    return this.lock.withLock(
      `matcher:${activityId}`,
      MATCHER_LOCK_TTL_SECONDS,
      () => this.runMatcherLocked(activityId),
      'Matcher is already running for this activity',
    )
  }

  private async runMatcherLocked(
    activityId: string,
  ): Promise<MatcherResult & { activityId: string }> {
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

    for (const assignment of result.assignments) {
      this.events.emit(DomainEvents.matcherRun, {
        userId: assignment.userId,
        sourceId: `${activityId}:${assignment.userId}`,
        title: 'Bạn đã được phân công nhiệm vụ',
        body: 'Kết quả ghép nhiệm vụ cho hoạt động đã sẵn sàng.',
        linkUrl: `/member/assignments`,
      })
    }

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

    const updated = await this.assignments.updateManual(id, {
      taskId: nextTaskId,
      userId: nextUserId,
      status: dto.status,
    })

    this.events.emit(DomainEvents.assignmentOverride, {
      userId: updated.userId,
      sourceId: `${updated.id}:${updated.status}`,
      title: 'Phân công của bạn đã được cập nhật',
      body: 'Quản trị viên vừa điều chỉnh phân công của bạn.',
      linkUrl: '/member/assignments',
    })

    return updated
  }

  async completeActivity(activityId: string) {
    return this.lock.withLock(
      `activity-complete:${activityId}`,
      MATCHER_LOCK_TTL_SECONDS,
      () => this.completeActivityLocked(activityId),
      'Activity completion already in progress',
    )
  }

  private async completeActivityLocked(activityId: string) {
    const activity = await this.activities.findById(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    if (activity.status === 'COMPLETED') {
      throw new ConflictException('Activity already completed')
    }
    if (activity.status !== 'MATCHED') {
      throw new UnprocessableEntityException('Activity must be MATCHED before completion')
    }

    const completed = await this.assignments.completeActivityAssignments(activityId)
    await this.activities.update(activityId, { status: 'COMPLETED' })

    for (const assignment of completed) {
      this.events.emit(DomainEvents.assignmentCompleted, {
        userId: assignment.userId,
        assignmentId: assignment.id,
        sourceId: assignment.id,
        title: 'Bạn đã hoàn thành nhiệm vụ',
        body: 'Cảm ơn bạn đã tham gia! Điểm đóng góp đã được ghi nhận.',
        linkUrl: '/member/impact',
      })
    }

    return { activityId, completedCount: completed.length }
  }
}
