import { Injectable, OnModuleInit } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DomainEvents, NotificationEventPayload } from '../../common/events/domain-events'
import { QUEUE_NAME, QueueService } from '../../common/queue'
import { NotificationsService } from './notifications.service'

interface NotificationJobPayload extends NotificationEventPayload {
  type: string
  sourceId?: string
}

@Injectable()
export class NotificationsListener implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit(): void {
    this.queue.register<NotificationJobPayload>(QUEUE_NAME.notifications, async (payload) => {
      const recipients = payload.userIds ?? (payload.userId ? [payload.userId] : [])
      await this.notifications.createForUsers(recipients, {
        type: payload.type,
        title: payload.title,
        body: payload.body,
        linkUrl: payload.linkUrl,
      })
    })
  }

  @OnEvent(DomainEvents.volunteerReviewed)
  enqueueVolunteerReviewed(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('volunteer_reviewed', payload)
  }

  @OnEvent(DomainEvents.matcherRun)
  enqueueMatcherRun(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('matcher_run', payload)
  }

  @OnEvent(DomainEvents.assignmentOverride)
  enqueueAssignmentOverride(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('assignment_override', payload)
  }

  @OnEvent(DomainEvents.orderStatusChanged)
  enqueueOrderStatusChanged(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('order_status_changed', payload)
  }

  @OnEvent(DomainEvents.articlePublished)
  enqueueArticlePublished(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('article_published', payload)
  }

  @OnEvent(DomainEvents.badgeUnlocked)
  enqueueBadgeUnlocked(payload: NotificationEventPayload & { sourceId?: string }) {
    return this.enqueue('badge_unlocked', payload)
  }

  private enqueue(type: string, payload: NotificationEventPayload & { sourceId?: string }) {
    const jobId = payload.sourceId ? `${type}:${payload.sourceId}` : undefined
    return this.queue.enqueue(QUEUE_NAME.notifications, { ...payload, type }, { jobId })
  }
}
