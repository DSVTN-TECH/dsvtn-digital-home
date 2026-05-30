export interface StreakSummary {
  currentStreak: number
  longestStreak: number
  totalPoints: number
  lastActivityDate: string | null
}

export interface LeaderboardRow {
  userId: string
  fullName: string
  totalPoints: number
}

export interface LeaderboardResponse {
  month: string
  rows: LeaderboardRow[]
}

export interface GamificationDataSource {
  getStreak(): Promise<StreakSummary>
  getLeaderboard(month?: string): Promise<LeaderboardResponse>
}
