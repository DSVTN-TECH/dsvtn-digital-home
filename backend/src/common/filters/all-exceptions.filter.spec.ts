import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { AllExceptionsFilter } from './all-exceptions.filter'

function mockHost(url = '/api/test', method = 'GET', requestId?: string) {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const getResponse = jest.fn().mockReturnValue({ status })
  const getRequest = jest.fn().mockReturnValue({
    url,
    method,
    headers: requestId ? { 'x-request-id': requestId } : {},
  })
  return {
    switchToHttp: () => ({ getRequest, getResponse }),
    json,
    status,
  }
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter

  beforeEach(() => {
    filter = new AllExceptionsFilter()
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined)
    jest.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined)
  })

  it('maps HttpException 400 → VALIDATION_ERROR code', () => {
    const host = mockHost()
    filter.catch(new BadRequestException('bad input'), host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(host.status).toHaveBeenCalledWith(400)
    expect(body.code).toBe('VALIDATION_ERROR')
    expect(body.message).toBe('bad input')
    expect(body.status).toBe(400)
    expect(body.path).toBe('/api/test')
    expect(body.timestamp).toBeDefined()
    expect(body.requestId).toBeDefined()
  })

  it('maps HttpException 404 → NOT_FOUND code', () => {
    const host = mockHost()
    filter.catch(new NotFoundException('resource missing'), host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(host.status).toHaveBeenCalledWith(404)
    expect(body.code).toBe('NOT_FOUND')
    expect(body.message).toBe('resource missing')
  })

  it('maps unknown Error → 500 INTERNAL_ERROR', () => {
    const host = mockHost()
    filter.catch(new Error('something exploded'), host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(host.status).toHaveBeenCalledWith(500)
    expect(body.code).toBe('INTERNAL_ERROR')
    expect(body.message).toBe('something exploded')
  })

  it('joins array validation messages into single string', () => {
    const host = mockHost()
    const exception = new HttpException(
      { message: ['field1 is required', 'field2 must be email'] },
      HttpStatus.BAD_REQUEST,
    )
    filter.catch(exception, host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(body.message).toBe('field1 is required; field2 must be email')
  })

  it('uses x-request-id header when provided', () => {
    const host = mockHost('/api/test', 'POST', 'my-request-id')
    filter.catch(new BadRequestException('err'), host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(body.requestId).toBe('my-request-id')
  })

  it('returns UNKNOWN_ERROR for unmapped status code', () => {
    const host = mockHost()
    filter.catch(new HttpException('teapot', 418), host as never)

    const body = host.status.mock.results[0].value.json.mock.calls[0][0]
    expect(body.code).toBe('UNKNOWN_ERROR')
  })
})
