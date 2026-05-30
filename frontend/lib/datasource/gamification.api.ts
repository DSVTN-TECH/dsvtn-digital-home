import { apiFetch } from '@/lib/api'
import type {
  GamificationDataSource,
  LeaderboardResponse,
  StreakSummary,
} from './gamification.datasource'

export class ApiGamificationDataSource implements GamificationDataSource {
  async getStreak(): Promise<StreakSummary> {
    return apiFetch<StreakSummary>('/member/streak')
  }

  async getLeaderboard(month?: string): Promise<LeaderboardResponse> {
    const query = month ? `?month=${encodeURIComponent(month)}` : ''
    return apiFetch<LeaderboardResponse>(`/member/leaderboard${query}`)
  }
}
