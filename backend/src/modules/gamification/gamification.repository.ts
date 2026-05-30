import { PointsLedger, Streak } from '@prisma/client'

export interface AddPointsData {
  userId: string
  amount: number
  reason: string
  sourceType: string
  sourceId?: string | null
}

export interface LeaderboardRow {
  userId: string
  fullName: string
  totalPoints: number
}

export abstract class GamificationRepository {
  abstract addPoints(data: AddPointsData): Promise<PointsLedger | null>
  abstract getTotalPoints(userId: string): Promise<number>
  abstract getLeaderboard(
    monthStart: Date,
    monthEnd: Date,
    limit: number,
  ): Promise<LeaderboardRow[]>
  abstract getStreak(userId: string): Promise<Streak | null>
  abstract upsertStreak(
    userId: string,
    data: { currentStreak: number; longestStreak: number; lastActivityDate: Date },
  ): Promise<Streak>
}
