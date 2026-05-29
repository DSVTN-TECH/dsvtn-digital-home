import { Logger } from '@nestjs/common'
import { ConsoleLogEmailProvider } from './console-log-email.provider'

describe('ConsoleLogEmailProvider', () => {
  it('logs email and returns NOT_CONFIGURED', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation()
    const provider = new ConsoleLogEmailProvider()

    const result = await provider.sendConfirmation('a@example.com', 'Subject', 'Body')

    expect(result).toBe('NOT_CONFIGURED')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('a@example.com'))
    logSpy.mockRestore()
  })
})
