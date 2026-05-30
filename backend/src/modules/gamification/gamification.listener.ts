import { Injectable, OnModuleInit } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DomainEvents } from '../../common/events/domain-events'
import { QUEUE_NAME, QueueService } from '../../common/queue'
import { GamificationService } from './gamification.service'

interface AssignmentCompletedEvent {
  userId?: string
  assignmentId?: string
  sourceId?: string
}

interface PointsJobPayload {
  userId: string
  assignmentId: string
}

@Injectable()
export class GamificationListener implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    private readonly gamification: GamificationService,
  ) {}

  onModuleInit(): void {
    this.queue.register<PointsJobPayload>(QUEUE_NAME.points, async (payload) => {
      await this.gamification.awardAssignmentCompleted(payload.userId, payload.assignmentId)
    })
  }

  @OnEvent(DomainEvents.assignmentCompleted)
  enqueuePoints(event: AssignmentCompletedEvent) {
    const userId = event.userId
    const assignmentId = event.assignmentId ?? event.sourceId
    if (!userId || !assignmentId) return
    return this.queue.enqueue(
      QUEUE_NAME.points,
      { userId, assignmentId },
      { jobId: `assignment_completed:${assignmentId}` },
    )
  }
}
