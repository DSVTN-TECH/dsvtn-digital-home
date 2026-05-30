import { Test } from '@nestjs/testing'
import { CacheService } from '../../common/cache'
import { GAMIFICATION_REPOSITORY } from '../../common/repository'
import { BadgesService } from '../badges/badges.service'
import { GamificationRepository } from './gamification.repository'
import { GamificationService } from './gamification.service'

describe('GamificationService', () => {
  let service: GamificationService
  let repo: jest.Mocked<GamificationRepository>
  let cache: { getOrSet: jest.Mock; invalidateByPrefix: jest.Mock }
  let badges: { awardByCode: jest.Mock }

  beforeEach(async () => {
    repo = {
      addPoints: jest.fn(),
      getTotalPoints: jest.fn().mockResolvedValue(0),
      getLeaderboard: jest.fn().mockResolvedValue([]),
      getStreak: jest.fn().mockResolvedValue(null),
      upsertStreak: jest.fn(),
    } as unknown as jest.Mocked<GamificationRepository>
    cache = {
      getOrSet: jest.fn((_key, factory) => factory()),
      invalidateByPrefix: jest.fn().mockResolvedValue(0),
    }
    badges = { awardByCode: jest.fn().mockResolvedValue({ awarded: false, badge: null }) }

    const moduleRef = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: GAMIFICATION_REPOSITORY, useValue: repo },
        { provide: CacheService, useValue: cache },
        { provide: BadgesService, useValue: badges },
      ],
    }).compile()
    service = moduleRef.get(GamificationService)
  })

  describe('awardAssignmentCompleted', () => {
    it('awards points, updates streak, and invalidates leaderboard cache', async () => {
      repo.addPoints.mockResolvedValue({
        id: 'p1',
        userId: 'u1',
        amount: 10,
        reason: 'ASSIGNMENT_COMPLETED',
        sourceType: 'assignment',
        sourceId: 'a1',
        createdAt: new Date(),
      })
      const result = await service.awardAssignmentCompleted('u1', 'a1', new Date('2026-05-10'))
      expect(result).toEqual({ awarded: true, points: 10 })
      expect(repo.upsertStreak).toHaveBeenCalled()
      expect(cache.invalidateByPrefix).toHaveBeenCalledWith('cache:leaderboard:')
    })

    it('is idempotent when points already recorded for the source', async () => {
      repo.addPoints.mockResolvedValue(null)
      const result = await service.awardAssignmentCompleted('u1', 'a1')
      expect(result).toEqual({ awarded: false })
      expect(repo.upsertStreak).not.toHaveBeenCalled()
      expect(cache.invalidateByPrefix).not.toHaveBeenCalled()
    })

    it('awards a points badge when threshold reached', async () => {
      repo.addPoints.mockResolvedValue({
        id: 'p1',
        userId: 'u1',
        amount: 10,
        reason: 'ASSIGNMENT_COMPLETED',
        sourceType: 'assignment',
        sourceId: 'a1',
        createdAt: new Date(),
      })
      repo.getTotalPoints.mockResolvedValue(120)
      await service.awardAssignmentCompleted('u1', 'a1', new Date('2026-05-10'))
      expect(badges.awardByCode).toHaveBeenCalledWith('u1', 'POINTS_100')
    })
  })

  describe('getLeaderboard', () => {
    it('reads through the cache for the requested month', async () => {
      await service.getLeaderboard('2026-05')
      expect(cache.getOrSet).toHaveBeenCalledWith(
        'cache:leaderboard:2026-05',
        expect.any(Function),
        60,
      )
      expect(repo.getLeaderboard).toHaveBeenCalled()
    })
  })

  describe('getStreak', () => {
    it('returns zeros when the user has no streak yet', async () => {
      repo.getStreak.mockResolvedValue(null)
      repo.getTotalPoints.mockResolvedValue(0)
      await expect(service.getStreak('u1')).resolves.toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        totalPoints: 0,
      })
    })
  })
})
