import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { QUEUE_NAME, QueueService } from '../../common/queue'

interface InviteEmailPayload {
  to: string
  subject: string
  body: string
}

@Injectable()
export class InvitesEmailListener implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  onModuleInit(): void {
    this.queue.register<InviteEmailPayload>(QUEUE_NAME.email, async (payload) => {
      await this.emailProvider.sendConfirmation(payload.to, payload.subject, payload.body)
    })
  }
}
