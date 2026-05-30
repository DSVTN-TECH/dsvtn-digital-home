export interface MemberProfile {
  id: string
  fullName: string
  email: string
  role: string
  fairnessScore: number
  joinedAt: Date
}

export interface ParticipationHistoryItem {
  activityId: string
  activityTitle: string
  taskName: string | null
  status: string
  date: Date
}

export interface MemberImpact {
  completedAssignments: number
  totalActivities: number
  totalPoints: number
  badgeCount: number
}

export abstract class ProfileRepository {
  abstract getProfile(userId: string): Promise<MemberProfile | null>
  abstract getParticipationHistory(userId: string): Promise<ParticipationHistoryItem[]>
  abstract getImpact(userId: string): Promise<MemberImpact>
}
