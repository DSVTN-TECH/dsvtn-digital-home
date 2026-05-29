import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConsoleLogEmailProvider } from './console-log-email.provider'
import { EmailProvider } from './email.provider'
import { EMAIL_PROVIDER } from './email.tokens'
import { ResendEmailProvider } from './resend-email.provider'

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): EmailProvider => {
        const apiKey = config.get<string>('EMAIL_API_KEY')
        const from = config.get<string>('EMAIL_FROM') ?? 'noreply@dsvtn.vn'

        return apiKey ? new ResendEmailProvider(apiKey, from) : new ConsoleLogEmailProvider()
      },
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
