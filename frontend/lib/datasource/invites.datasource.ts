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
