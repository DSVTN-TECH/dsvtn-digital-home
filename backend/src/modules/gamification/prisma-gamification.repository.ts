import { Injectable } from '@nestjs/common'
import { PointsLedger, Streak } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AddPointsData, GamificationRepository, LeaderboardRow } from './gamification.repository'

@Injectable()
export class PrismaGamificationRepository extends GamificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async addPoints(data: AddPointsData): Promise<PointsLedger | null> {
    try {
      return await this.prisma.pointsLedger.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          reason: data.reason,
          sourceType: data.sourceType,
          sourceId: data.sourceId ?? null,
        },
      })
    } catch {
      return null
    }
  }

  async getTotalPoints(userId: string): Promise<number> {
    const result = await this.prisma.pointsLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  async getLeaderboard(monthStart: Date, monthEnd: Date, limit: number): Promise<LeaderboardRow[]> {
    const grouped = await this.prisma.pointsLedger.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    })

    if (grouped.length === 0) return []

    const users = await this.prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: { id: true, fullName: true },
    })
    const nameById = new Map(users.map((u) => [u.id, u.fullName]))

    return grouped.map((g) => ({
      userId: g.userId,
      fullName: nameById.get(g.userId) ?? 'Unknown',
      totalPoints: g._sum.amount ?? 0,
    }))
  }

  async getStreak(userId: string): Promise<Streak | null> {
    return this.prisma.streak.findUnique({ where: { userId } })
  }

  async upsertStreak(
    userId: string,
    data: { currentStreak: number; longestStreak: number; lastActivityDate: Date },
  ): Promise<Streak> {
    return this.prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastActivityDate: data.lastActivityDate,
      },
      update: {
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastActivityDate: data.lastActivityDate,
      },
    })
  }
}
