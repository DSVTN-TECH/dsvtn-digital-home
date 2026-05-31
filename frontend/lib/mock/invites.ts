import type { InviteItem } from '@/lib/datasource/invites.datasource'

export const mockInvites: InviteItem[] = [
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
