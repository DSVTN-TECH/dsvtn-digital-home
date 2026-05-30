import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PROFILE_REPOSITORY } from '../../common/repository'
import { BadgesService } from '../badges/badges.service'
import { ProfileRepository } from './profile.repository'
import { ProfileService } from './profile.service'

describe('ProfileService', () => {
  let service: ProfileService
  let repo: jest.Mocked<ProfileRepository>
  let badges: { listUserBadges: jest.Mock }

  beforeEach(async () => {
    repo = {
      getProfile: jest.fn(),
      getParticipationHistory: jest.fn(),
      getImpact: jest.fn(),
    } as unknown as jest.Mocked<ProfileRepository>
    badges = { listUserBadges: jest.fn().mockResolvedValue([]) }

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PROFILE_REPOSITORY, useValue: repo },
        { provide: BadgesService, useValue: badges },
      ],
    }).compile()
    service = moduleRef.get(ProfileService)
  })

  describe('getOwnProfile', () => {
    it('throws NotFound when profile missing', async () => {
      repo.getProfile.mockResolvedValue(null)
      await expect(service.getOwnProfile('user-1')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('aggregates profile, history, and badges', async () => {
      repo.getProfile.mockResolvedValue({
        id: 'user-1',
        fullName: 'A',
        email: 'a@x.vn',
        role: 'MEMBER',
        fairnessScore: 0,
        joinedAt: new Date('2026-01-01T00:00:00.000Z'),
      })
      repo.getParticipationHistory.mockResolvedValue([])
      const result = await service.getOwnProfile('user-1')
      expect(result.profile.id).toBe('user-1')
      expect(result.history).toEqual([])
      expect(badges.listUserBadges).toHaveBeenCalledWith('user-1')
    })
  })

  describe('getOwnImpact', () => {
    it('throws NotFound when profile missing', async () => {
      repo.getProfile.mockResolvedValue(null)
      await expect(service.getOwnImpact('user-1')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('returns impact KPIs when profile exists', async () => {
      repo.getProfile.mockResolvedValue({
        id: 'user-1',
        fullName: 'A',
        email: 'a@x.vn',
        role: 'MEMBER',
        fairnessScore: 0,
        joinedAt: new Date('2026-01-01T00:00:00.000Z'),
      })
      repo.getImpact.mockResolvedValue({
        completedAssignments: 2,
        totalActivities: 5,
        totalPoints: 120,
        badgeCount: 1,
      })
      await expect(service.getOwnImpact('user-1')).resolves.toEqual({
        completedAssignments: 2,
        totalActivities: 5,
        totalPoints: 120,
        badgeCount: 1,
      })
    })
  })
})
