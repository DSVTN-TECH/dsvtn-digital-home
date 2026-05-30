import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PROFILE_REPOSITORY } from '../../common/repository'
import { BadgesService } from '../badges/badges.service'
import { ProfileRepository } from './profile.repository'

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PROFILE_REPOSITORY) private readonly repo: ProfileRepository,
    private readonly badges: BadgesService,
  ) {}

  async getOwnProfile(userId: string) {
    const profile = await this.repo.getProfile(userId)
    if (!profile) throw new NotFoundException('Profile not found')
    const [history, badges] = await Promise.all([
      this.repo.getParticipationHistory(userId),
      this.badges.listUserBadges(userId),
    ])
    return { profile, history, badges }
  }

  async getOwnImpact(userId: string) {
    const profile = await this.repo.getProfile(userId)
    if (!profile) throw new NotFoundException('Profile not found')
    return this.repo.getImpact(userId)
  }
}
