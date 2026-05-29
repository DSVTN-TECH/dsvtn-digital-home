export type EmailSendStatus = 'NOT_CONFIGURED' | 'SENT'

export interface EmailProvider {
  sendConfirmation(to: string, subject: string, body: string): Promise<EmailSendStatus>
}
