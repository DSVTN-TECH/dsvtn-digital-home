import { ResendEmailProvider } from './resend-email.provider'

describe('ResendEmailProvider', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('calls Resend emails endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock
    const provider = new ResendEmailProvider('test-key', 'noreply@dsvtn.vn')

    const result = await provider.sendConfirmation('a@example.com', 'Subject', 'Body')

    expect(result).toBe('SENT')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      }),
    )
  })

  it('throws when Resend returns non-2xx', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: 'bad key' }),
    })
    const provider = new ResendEmailProvider('bad-key', 'noreply@dsvtn.vn')

    await expect(provider.sendConfirmation('a@example.com', 'Subject', 'Body')).rejects.toThrow(
      'bad key',
    )
  })
})
