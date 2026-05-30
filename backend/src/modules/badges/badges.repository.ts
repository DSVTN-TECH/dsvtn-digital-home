import { Badge, UserBadge } from '@prisma/client'

export interface CreateBadgeData {
  code: string
  name: string
  description?: string | null
  iconUrl?: string | null
  criteriaType: string
  criteriaThreshold: number
}

export interface UserBadgeWithBadge extends UserBadge {
  badge: Badge
}

export abstract class BadgesRepository {
  abstract findAll(): Promise<Badge[]>
  abstract findByCode(code: string): Promise<Badge | null>
  abstract create(data: CreateBadgeData): Promise<Badge>
  abstract findUserBadges(userId: string): Promise<UserBadgeWithBadge[]>
  abstract hasBadge(userId: string, badgeId: string): Promise<boolean>
  abstract award(userId: string, badgeId: string): Promise<UserBadge | null>
}
