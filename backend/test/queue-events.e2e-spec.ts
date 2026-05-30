import { INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { DomainEvents, NotificationEventPayload } from '../src/common/events/domain-events'
import { QUEUE_NAME, QueueService } from '../src/common/queue'

describe('Queue-backed domain events (e2e)', () => {
  let app: INestApplication
  let events: EventEmitter2
  let queue: QueueService

  beforeAll(async () => {
    process.env.QUEUE_ENABLED = 'true'
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
    events = app.get(EventEmitter2)
    queue = app.get(QueueService)
  })

  afterAll(async () => {
    await app.close()
  })

  it('emits a domain event, enqueues a notification job, and delivers the side effect', async () => {
    const delivered: NotificationEventPayload[] = []
    queue.register<NotificationEventPayload>(QUEUE_NAME.notifications, async (payload) => {
      delivered.push(payload)
    })

    events.emit(DomainEvents.articlePublished, {
      userIds: ['user-1'],
      title: 'Bài viết mới',
      body: 'Một bài viết mới đã được đăng.',
      linkUrl: '/news/demo',
    })

    await eventually(() => expect(delivered).toHaveLength(1))
    expect(delivered[0]).toMatchObject({
      userIds: ['user-1'],
      title: 'Bài viết mới',
      linkUrl: '/news/demo',
    })
  })
})

async function eventually(assertion: () => void): Promise<void> {
  let lastError: unknown
  for (let i = 0; i < 20; i += 1) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }
  throw lastError
}
