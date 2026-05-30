import { Injectable } from '@nestjs/common'
import { Badge, UserBadge } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { BadgesRepository, CreateBadgeData, UserBadgeWithBadge } from './badges.repository'

@Injectable()
export class PrismaBadgesRepository extends BadgesRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findAll(): Promise<Badge[]> {
    return this.prisma.badge.findMany({ orderBy: { criteriaThreshold: 'asc' } })
  }

  async findByCode(code: string): Promise<Badge | null> {
    return this.prisma.badge.findUnique({ where: { code } })
  }

  async create(data: CreateBadgeData): Promise<Badge> {
    return this.prisma.badge.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        iconUrl: data.iconUrl ?? null,
        criteriaType: data.criteriaType,
        criteriaThreshold: data.criteriaThreshold,
      },
    })
  }

  async findUserBadges(userId: string): Promise<UserBadgeWithBadge[]> {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    })
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    })
    return existing !== null
  }

  async award(userId: string, badgeId: string): Promise<UserBadge | null> {
    try {
      return await this.prisma.userBadge.create({ data: { userId, badgeId } })
    } catch {
      return null
    }
  }
}
