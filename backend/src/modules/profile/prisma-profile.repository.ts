import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  MemberImpact,
  MemberProfile,
  ParticipationHistoryItem,
  ProfileRepository,
} from './profile.repository'

@Injectable()
export class PrismaProfileRepository extends ProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async getProfile(userId: string): Promise<MemberProfile | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      fairnessScore: user.fairnessScore,
      joinedAt: user.createdAt,
    }
  }

  async getParticipationHistory(userId: string): Promise<ParticipationHistoryItem[]> {
    const assignments = await this.prisma.assignment.findMany({
      where: { userId },
      include: { activity: true, task: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return assignments.map((assignment) => ({
      activityId: assignment.activityId,
      activityTitle: assignment.activity.title,
      taskName: assignment.task.name,
      status: assignment.status,
      date: assignment.createdAt,
    }))
  }

  async getImpact(userId: string): Promise<MemberImpact> {
    const [completedAssignments, totalActivities, points, badgeCount] =
      await this.prisma.$transaction([
        this.prisma.assignment.count({ where: { userId, status: 'COMPLETED' } }),
        this.prisma.activityRegistration.count({ where: { userId } }),
        this.prisma.pointsLedger.aggregate({ where: { userId }, _sum: { amount: true } }),
        this.prisma.userBadge.count({ where: { userId } }),
      ])

    return {
      completedAssignments,
      totalActivities,
      totalPoints: points._sum.amount ?? 0,
      badgeCount,
    }
  }
}
