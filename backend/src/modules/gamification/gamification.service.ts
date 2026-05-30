import { Inject, Injectable } from '@nestjs/common'
import { CacheService } from '../../common/cache'
import { GAMIFICATION_REPOSITORY } from '../../common/repository'
import { BadgesService } from '../badges/badges.service'
import { GamificationRepository, LeaderboardRow } from './gamification.repository'
import { nextStreak } from './streak'

const ASSIGNMENT_COMPLETED_POINTS = 10
const LEADERBOARD_CACHE_TTL_SECONDS = 60

export interface StreakSummary {
  currentStreak: number
  longestStreak: number
  totalPoints: number
  lastActivityDate: Date | null
}

@Injectable()
export class GamificationService {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY) private readonly repo: GamificationRepository,
    private readonly cache: CacheService,
    private readonly badges: BadgesService,
  ) {}

  async awardAssignmentCompleted(userId: string, assignmentId: string, activityDate = new Date()) {
    const ledger = await this.repo.addPoints({
      userId,
      amount: ASSIGNMENT_COMPLETED_POINTS,
      reason: 'ASSIGNMENT_COMPLETED',
      sourceType: 'assignment',
      sourceId: assignmentId,
    })

    if (!ledger) {
      return { awarded: false }
    }

    await this.updateStreak(userId, activityDate)
    await this.evaluatePointBadges(userId)
    await this.cache.invalidateByPrefix('cache:leaderboard:')

    return { awarded: true, points: ASSIGNMENT_COMPLETED_POINTS }
  }

  async getStreak(userId: string): Promise<StreakSummary> {
    const [streak, totalPoints] = await Promise.all([
      this.repo.getStreak(userId),
      this.repo.getTotalPoints(userId),
    ])

    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActivityDate: streak?.lastActivityDate ?? null,
      totalPoints,
    }
  }

  async getLeaderboard(month?: string): Promise<{ month: string; rows: LeaderboardRow[] }> {
    const selectedMonth = month ?? this.currentMonth()
    const key = `cache:leaderboard:${selectedMonth}`
    return this.cache.getOrSet(
      key,
      async () => {
        const { start, end } = this.monthRange(selectedMonth)
        const rows = await this.repo.getLeaderboard(start, end, 50)
        return { month: selectedMonth, rows }
      },
      LEADERBOARD_CACHE_TTL_SECONDS,
    )
  }

  private async updateStreak(userId: string, activityDate: Date) {
    const current = await this.repo.getStreak(userId)
    const next = nextStreak(
      {
        currentStreak: current?.currentStreak ?? 0,
        longestStreak: current?.longestStreak ?? 0,
        lastActivityDate: current?.lastActivityDate ?? null,
      },
      activityDate,
    )
    await this.repo.upsertStreak(userId, {
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastActivityDate: next.lastActivityDate ?? activityDate,
    })
  }

  private async evaluatePointBadges(userId: string): Promise<void> {
    const totalPoints = await this.repo.getTotalPoints(userId)
    if (totalPoints >= 100) await this.badges.awardByCode(userId, 'POINTS_100')
    if (totalPoints >= 500) await this.badges.awardByCode(userId, 'POINTS_500')
  }

  private currentMonth(): string {
    const now = new Date()
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  }

  private monthRange(month: string): { start: Date; end: Date } {
    const [year, monthNumber] = month.split('-').map(Number)
    const start = new Date(Date.UTC(year, monthNumber - 1, 1))
    const end = new Date(Date.UTC(year, monthNumber, 1))
    return { start, end }
  }
}
