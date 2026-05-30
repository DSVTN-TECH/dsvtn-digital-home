import { ConflictException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test } from '@nestjs/testing'
import { Badge, UserBadge } from '@prisma/client'
import { DomainEvents } from '../../common/events/domain-events'
import { BADGES_REPOSITORY } from '../../common/repository'
import { BadgesRepository } from './badges.repository'
import { BadgesService } from './badges.service'

function makeBadge(overrides: Partial<Badge> = {}): Badge {
  return {
    id: 'badge-1',
    code: 'POINTS_100',
    name: 'Centurion',
    description: null,
    iconUrl: null,
    criteriaType: 'POINTS_TOTAL',
    criteriaThreshold: 100,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('BadgesService', () => {
  let service: BadgesService
  let repo: jest.Mocked<BadgesRepository>
  let events: { emit: jest.Mock }

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      findUserBadges: jest.fn(),
      hasBadge: jest.fn(),
      award: jest.fn(),
    } as unknown as jest.Mocked<BadgesRepository>
    events = { emit: jest.fn() }

    const moduleRef = await Test.createTestingModule({
      providers: [
        BadgesService,
        { provide: BADGES_REPOSITORY, useValue: repo },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile()
    service = moduleRef.get(BadgesService)
  })

  describe('createDefinition', () => {
    it('rejects duplicate codes', async () => {
      repo.findByCode.mockResolvedValue(makeBadge())
      await expect(
        service.createDefinition({
          code: 'POINTS_100',
          name: 'x',
          criteriaType: 'POINTS_TOTAL',
          criteriaThreshold: 100,
        }),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it('creates when code is unique', async () => {
      repo.findByCode.mockResolvedValue(null)
      repo.create.mockResolvedValue(makeBadge())
      await service.createDefinition({
        code: 'POINTS_100',
        name: 'Centurion',
        criteriaType: 'POINTS_TOTAL',
        criteriaThreshold: 100,
      })
      expect(repo.create).toHaveBeenCalled()
    })
  })

  describe('award', () => {
    it('awards a new badge and emits badge.unlocked', async () => {
      repo.award.mockResolvedValue({
        id: 'ub-1',
        userId: 'user-1',
        badgeId: 'badge-1',
        awardedAt: new Date(),
      } as UserBadge)
      const result = await service.award('user-1', makeBadge())
      expect(result.awarded).toBe(true)
      expect(events.emit).toHaveBeenCalledWith(
        DomainEvents.badgeUnlocked,
        expect.objectContaining({ userId: 'user-1', sourceId: 'ub-1' }),
      )
    })

    it('does not emit when the badge was already awarded (idempotent)', async () => {
      repo.award.mockResolvedValue(null)
      const result = await service.award('user-1', makeBadge())
      expect(result.awarded).toBe(false)
      expect(events.emit).not.toHaveBeenCalled()
    })
  })

  describe('awardByCode', () => {
    it('no-ops when the badge code is unknown', async () => {
      repo.findByCode.mockResolvedValue(null)
      const result = await service.awardByCode('user-1', 'MISSING')
      expect(result).toEqual({ awarded: false, badge: null })
      expect(repo.award).not.toHaveBeenCalled()
    })
  })
})
