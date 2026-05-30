export interface MemberProfileInfo {
  id: string
  fullName: string
  email: string
  role: string
  fairnessScore: number
  joinedAt: string
}

export interface ParticipationHistoryItem {
  activityId: string
  activityTitle: string
  taskName: string | null
  status: string
  date: string
}

export interface EarnedBadge {
  id: string
  badgeId: string
  awardedAt: string
  badge: {
    id: string
    code: string
    name: string
    description: string | null
    iconUrl: string | null
  }
}

export interface MemberProfileResponse {
  profile: MemberProfileInfo
  history: ParticipationHistoryItem[]
  badges: EarnedBadge[]
}

export interface MemberImpact {
  completedAssignments: number
  totalActivities: number
  totalPoints: number
  badgeCount: number
}

export interface ProfileDataSource {
  getProfile(): Promise<MemberProfileResponse>
  getImpact(): Promise<MemberImpact>
}
