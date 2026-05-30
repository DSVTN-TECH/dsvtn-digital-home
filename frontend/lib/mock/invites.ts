import type {
  AcceptInviteInput,
  CreateInviteInput,
  CreateInviteResponse,
  InviteItem,
  InviteStatus,
  InvitesDataSource,
  InvitesListResponse,
} from '@/lib/datasource/invites'

const invites: InviteItem[] = [
  {
    id: 'mock-invite-1',
    email: 'new.member@example.com',
    role: 'MEMBER',
    status: 'PENDING',
    invitedById: 'mock-admin',
    expiresAt: '2026-06-15T00:00:00.000Z',
    acceptedAt: null,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
]

export class MockInvitesDataSource implements InvitesDataSource {
  async list(status?: InviteStatus): Promise<InvitesListResponse> {
    const filtered = status ? invites.filter((invite) => invite.status === status) : invites
    return Promise.resolve({
      items: [...filtered],
      pagination: { page: 1, pageSize: 20, total: filtered.length, totalPages: 1 },
    })
  }

  async create(input: CreateInviteInput): Promise<CreateInviteResponse> {
    const now = new Date().toISOString()
    const invite: InviteItem = {
      id: `mock-invite-${Date.now()}`,
      email: input.email,
      role: input.role,
      status: 'PENDING',
      invitedById: 'mock-admin',
      expiresAt: new Date(Date.now() + (input.expiresInDays ?? 7) * 86400000).toISOString(),
      acceptedAt: null,
      createdAt: now,
    }
    invites.unshift(invite)
    return Promise.resolve({ ...invite, token: `mock-token-${invite.id}` })
  }

  async revoke(id: string): Promise<InviteItem> {
    const index = invites.findIndex((invite) => invite.id === id)
    if (index < 0) throw new Error('Không tìm thấy invite')
    const current = invites[index]
    if (current.status !== 'PENDING') throw new Error('Invite không còn hiệu lực')
    const updated = { ...current, status: 'REVOKED' as const }
    invites[index] = updated
    return Promise.resolve(updated)
  }

  async accept(input: AcceptInviteInput): Promise<{ accepted: boolean }> {
    if (input.token.includes('expired')) throw new Error('Invite đã hết hạn')
    if (input.password.length < 8) throw new Error('Mật khẩu tối thiểu 8 ký tự')
    return Promise.resolve({ accepted: true })
  }
}
