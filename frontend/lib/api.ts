import { ApiErrorBody } from '@/types/api'
import { getCsrfToken } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export class ApiError extends Error {
  constructor(public readonly body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
  }

  get status() {
    return this.body.status
  }

  get code() {
    return this.body.code
  }

  get requestId() {
    return this.body.requestId
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const method = options.method?.toUpperCase() ?? 'GET'
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      timestamp: new Date().toISOString(),
      status: response.status,
      error: response.statusText,
      message: response.statusText || 'Request failed',
      code: 'UNKNOWN_ERROR',
      path,
      requestId: '',
    }))) as ApiErrorBody
    throw new ApiError(body)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
