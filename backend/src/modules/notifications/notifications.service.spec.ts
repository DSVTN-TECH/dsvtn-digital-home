import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Notification } from '@prisma/client'
import { NOTIFICATIONS_REPOSITORY } from '../../common/repository'
import { NotificationsRepository } from './notifications.repository'
import { NotificationsService } from './notifications.service'

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'user-1',
    type: 'article_published',
    title: 'T',
    body: null,
    linkUrl: null,
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('NotificationsService', () => {
  let service: NotificationsService
  let repo: jest.Mocked<NotificationsRepository>

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      createMany: jest.fn().mockResolvedValue(0),
      listByUser: jest.fn(),
      findById: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<NotificationsRepository>

    const moduleRef = await Test.createTestingModule({
      providers: [NotificationsService, { provide: NOTIFICATIONS_REPOSITORY, useValue: repo }],
    }).compile()
    service = moduleRef.get(NotificationsService)
  })

  describe('markRead', () => {
    it('throws NotFound when the notification does not exist', async () => {
      repo.findById.mockResolvedValue(null)
      await expect(service.markRead('n1', 'user-1')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('throws Forbidden when notification belongs to another user', async () => {
      repo.findById.mockResolvedValue(makeNotification({ userId: 'user-2' }))
      await expect(service.markRead('n1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException)
      expect(repo.markRead).not.toHaveBeenCalled()
    })

    it('marks read when the caller owns the notification', async () => {
      repo.findById.mockResolvedValue(makeNotification())
      repo.markRead.mockResolvedValue(makeNotification({ isRead: true }))
      const result = await service.markRead('n1', 'user-1')
      expect(repo.markRead).toHaveBeenCalledWith('n1', 'user-1')
      expect(result?.isRead).toBe(true)
    })
  })

  describe('markAllRead', () => {
    it('returns the updated count', async () => {
      repo.markAllRead.mockResolvedValue(3)
      await expect(service.markAllRead('user-1')).resolves.toEqual({ updated: 3 })
    })
  })

  describe('createForUsers', () => {
    it('deduplicates recipients before fan-out', async () => {
      repo.createMany.mockResolvedValue(2)
      await service.createForUsers(['u1', 'u1', 'u2'], {
        type: 'matcher_run',
        title: 'Matcher done',
      })
      expect(repo.createMany).toHaveBeenCalledWith([
        { userId: 'u1', type: 'matcher_run', title: 'Matcher done' },
        { userId: 'u2', type: 'matcher_run', title: 'Matcher done' },
      ])
    })

    it('does not call repository when there are no recipients', async () => {
      await service.createForUsers([], { type: 'x', title: 'y' })
      expect(repo.createMany).toHaveBeenCalledWith([])
    })
  })
})
