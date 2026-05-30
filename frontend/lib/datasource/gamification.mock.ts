import type {
  GamificationDataSource,
  LeaderboardResponse,
  StreakSummary,
} from './gamification.datasource'

export class MockGamificationDataSource implements GamificationDataSource {
  async getStreak(): Promise<StreakSummary> {
    return Promise.resolve({
      currentStreak: 4,
      longestStreak: 9,
      totalPoints: 180,
      lastActivityDate: '2026-05-28T00:00:00.000Z',
    })
  }

  async getLeaderboard(month?: string): Promise<LeaderboardResponse> {
    return Promise.resolve({
      month: month ?? '2026-05',
      rows: [
        { userId: 'u2', fullName: 'Trần Hải Đăng', totalPoints: 260 },
        { userId: 'mock-user', fullName: 'Nguyễn Tình Nguyện', totalPoints: 180 },
        { userId: 'u3', fullName: 'Lê Minh Thư', totalPoints: 150 },
      ],
    })
  }
}
