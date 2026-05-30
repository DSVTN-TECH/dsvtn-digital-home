import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Badge } from '@prisma/client'
import { DomainEvents } from '../../common/events/domain-events'
import { BADGES_REPOSITORY } from '../../common/repository'
import { BadgesRepository, CreateBadgeData } from './badges.repository'

export interface BadgeAwardResult {
  awarded: boolean
  badge: Badge | null
}

@Injectable()
export class BadgesService {
  constructor(
    @Inject(BADGES_REPOSITORY) private readonly repo: BadgesRepository,
    private readonly events: EventEmitter2,
  ) {}

  async listDefinitions(): Promise<Badge[]> {
    return this.repo.findAll()
  }

  async listUserBadges(userId: string) {
    return this.repo.findUserBadges(userId)
  }

  async createDefinition(data: CreateBadgeData): Promise<Badge> {
    const existing = await this.repo.findByCode(data.code)
    if (existing) {
      throw new ConflictException(`Badge code ${data.code} already exists`)
    }
    return this.repo.create(data)
  }

  async awardByCode(userId: string, code: string): Promise<BadgeAwardResult> {
    const badge = await this.repo.findByCode(code)
    if (!badge) return { awarded: false, badge: null }
    return this.award(userId, badge)
  }

  async award(userId: string, badge: Badge): Promise<BadgeAwardResult> {
    const userBadge = await this.repo.award(userId, badge.id)
    if (!userBadge) {
      return { awarded: false, badge }
    }

    this.events.emit(DomainEvents.badgeUnlocked, {
      userId,
      sourceId: userBadge.id,
      title: 'Bạn vừa mở khoá huy hiệu mới',
      body: badge.name,
      linkUrl: '/member/profile',
    })

    return { awarded: true, badge }
  }
}
