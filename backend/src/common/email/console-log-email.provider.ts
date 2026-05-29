import { Logger } from '@nestjs/common'
import { EmailProvider, EmailSendStatus } from './email.provider'

export class ConsoleLogEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ConsoleLogEmailProvider.name)

  async sendConfirmation(to: string, subject: string, body: string): Promise<EmailSendStatus> {
    this.logger.log(`Email not configured; would send confirmation to ${to}: ${subject} ${body}`)
    return 'NOT_CONFIGURED'
  }
}
