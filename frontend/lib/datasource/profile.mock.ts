import type { MemberImpact, MemberProfileResponse, ProfileDataSource } from './profile.datasource'

export class MockProfileDataSource implements ProfileDataSource {
  async getProfile(): Promise<MemberProfileResponse> {
    return Promise.resolve({
      profile: {
        id: 'mock-user',
        fullName: 'Nguyễn Tình Nguyện',
        email: 'member@dsvtn.vn',
        role: 'MEMBER',
        fairnessScore: 12,
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      history: [
        {
          activityId: 'act-1',
          activityTitle: 'Mùa hè xanh',
          taskName: 'Hậu cần',
          status: 'COMPLETED',
          date: '2026-05-01T08:00:00.000Z',
        },
        {
          activityId: 'act-2',
          activityTitle: 'Tiếp sức mùa thi',
          taskName: 'Điều phối',
          status: 'CONFIRMED',
          date: '2026-05-20T08:00:00.000Z',
        },
      ],
      badges: [
        {
          id: 'ub-1',
          badgeId: 'badge-1',
          awardedAt: '2026-05-10T00:00:00.000Z',
          badge: {
            id: 'badge-1',
            code: 'POINTS_100',
            name: 'Centurion',
            description: 'Đạt 100 điểm đóng góp',
            iconUrl: null,
          },
        },
      ],
    })
  }

  async getImpact(): Promise<MemberImpact> {
    return Promise.resolve({
      completedAssignments: 8,
      totalActivities: 12,
      totalPoints: 180,
      badgeCount: 1,
    })
  }
}
