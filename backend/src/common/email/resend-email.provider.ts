import { EmailProvider, EmailSendStatus } from './email.provider'

interface ResendErrorBody {
  message?: string
}

export class ResendEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendConfirmation(to: string, subject: string, body: string): Promise<EmailSendStatus> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to,
        subject,
        text: body,
      }),
    })

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ResendErrorBody
      throw new Error(error.message ?? `Resend request failed with ${response.status}`)
    }

    return 'SENT'
  }
}
