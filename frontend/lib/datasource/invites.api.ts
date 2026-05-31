import { apiFetch } from '@/lib/api'
import type {
  AcceptInviteInput,
  CreateInviteInput,
  CreateInviteResponse,
  InviteItem,
  InviteStatus,
  InvitesDataSource,
  InvitesListResponse,
} from './invites.datasource'

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
