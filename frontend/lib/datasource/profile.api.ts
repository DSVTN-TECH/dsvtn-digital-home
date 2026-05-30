import { apiFetch } from '@/lib/api'
import type { MemberImpact, MemberProfileResponse, ProfileDataSource } from './profile.datasource'

export class ApiProfileDataSource implements ProfileDataSource {
  async getProfile(): Promise<MemberProfileResponse> {
    return apiFetch<MemberProfileResponse>('/member/profile')
  }

  async getImpact(): Promise<MemberImpact> {
    return apiFetch<MemberImpact>('/member/profile/impact')
  }
}
