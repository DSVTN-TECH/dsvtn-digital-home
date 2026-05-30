import { apiFetch } from '@/lib/api'
import { MockInvitesDataSource } from '@/lib/mock/invites'

export type InviteRole = 'ADMIN' | 'MEMBER' | 'LOGISTIC'
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'

export interface InviteItem {
  id: string
  email: string
  role: InviteRole
  status: InviteStatus
  invitedById: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
}

export interface CreateInviteInput {
  email: string
  role: InviteRole
  expiresInDays?: number
}

export interface CreateInviteResponse extends InviteItem {
  token: string
}

export interface InvitesListResponse {
  items: InviteItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface AcceptInviteInput {
  token: string
  fullName: string
  password: string
}

export interface InvitesDataSource {
  list(status?: InviteStatus): Promise<InvitesListResponse>
  create(input: CreateInviteInput): Promise<CreateInviteResponse>
  revoke(id: string): Promise<InviteItem>
  accept(input: AcceptInviteInput): Promise<{ accepted: boolean }>
}

export class ApiInvitesDataSource implements InvitesDataSource {
  async list(status?: InviteStatus): Promise<InvitesListResponse> {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiFetch<InvitesListResponse>(`/admin/invites${query}`)
  }

  async create(input: CreateInviteInput): Promise<CreateInviteResponse> {
    return apiFetch<CreateInviteResponse>('/admin/invites', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async revoke(id: string): Promise<InviteItem> {
    return apiFetch<InviteItem>(`/admin/invites/${id}/revoke`, { method: 'PATCH' })
  }

  async accept(input: AcceptInviteInput): Promise<{ accepted: boolean }> {
    return apiFetch<{ accepted: boolean }>(`/public/invites/${input.token}/accept`, {
      method: 'POST',
      body: JSON.stringify({ fullName: input.fullName, password: input.password }),
    })
  }
}

let invitesDataSource: InvitesDataSource | null = null

export function getInvitesDataSource(): InvitesDataSource {
  if (!invitesDataSource) {
    const mode = (process.env.NEXT_PUBLIC_DATA_SOURCE as 'mock' | 'api') ?? 'mock'
    invitesDataSource = mode === 'api' ? new ApiInvitesDataSource() : new MockInvitesDataSource()
  }
  return invitesDataSource
}
