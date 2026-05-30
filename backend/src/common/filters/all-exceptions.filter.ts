import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

interface ErrorResponseBody {
  timestamp: string
  status: number
  error: string
  message: string
  code: string
  path: string
  requestId: string
  details?: Record<string, unknown>
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const requestId = (request.headers['x-request-id'] as string) ?? randomUUID()
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const httpMessage = this.extractMessage(exception)
    const code = this.extractCode(exception) ?? this.mapStatusToCode(status)
    const error = HttpStatus[status] ?? 'Internal Server Error'
    const details = this.extractDetails(exception)

    const body: ErrorResponseBody = {
      timestamp: new Date().toISOString(),
      status,
      error: error.replace(/_/g, ' '),
      message: httpMessage,
      code,
      path: request.url,
      requestId,
    }

    if (details) body.details = details

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url}`,
        (exception as Error)?.stack,
      )
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} → ${status}: ${httpMessage}`,
      )
    }

    response.status(status).json(body)
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const res = exception.getResponse()
      if (typeof res === 'string') return res
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>
        if (Array.isArray(obj.message)) return obj.message.join('; ')
        if (typeof obj.message === 'string') return obj.message
      }
      return exception.message
    }
    if (exception instanceof Error) return exception.message
    return 'Internal server error'
  }

  private extractCode(exception: unknown): string | null {
    if (!(exception instanceof HttpException)) return null
    const res = exception.getResponse()
    if (typeof res !== 'object' || res === null) return null
    const code = (res as Record<string, unknown>).code
    return typeof code === 'string' ? code : null
  }

  private extractDetails(exception: unknown): Record<string, unknown> | undefined {
    if (!(exception instanceof HttpException)) return undefined
    const res = exception.getResponse()
    if (typeof res !== 'object' || res === null) return undefined
    const details = (res as Record<string, unknown>).details
    if (typeof details === 'object' && details !== null) {
      return details as Record<string, unknown>
    }
    return undefined
  }

  private mapStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_ERROR',
    }
    return map[status] ?? 'UNKNOWN_ERROR'
  }
}
