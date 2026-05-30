import { Invite, InviteStatus, Role } from '@prisma/client'

export const INVITES_REPOSITORY = Symbol('INVITES_REPOSITORY')

export interface CreateInviteData {
  email: string
  role: Role
  tokenHash: string
  invitedById: string
  expiresAt: Date
}

export interface InviteListFilter {
  status?: InviteStatus
  skip: number
  take: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
}

export abstract class InvitesRepository {
  abstract list(filter: InviteListFilter): Promise<PagedResult<Invite>>
  abstract findById(id: string): Promise<Invite | null>
  abstract findByTokenHash(tokenHash: string): Promise<Invite | null>
  abstract create(data: CreateInviteData): Promise<Invite>
  abstract updateStatus(id: string, status: InviteStatus, acceptedAt?: Date): Promise<Invite>
}
