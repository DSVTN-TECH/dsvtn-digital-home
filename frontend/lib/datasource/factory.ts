import type { ActivitiesDataSource } from './activities.datasource'
import { ApiActivitiesDataSource } from './activities.api'
import { MockActivitiesDataSource } from './activities.mock'
import type { VolunteerDataSource } from './volunteer.datasource'
import { ApiVolunteerDataSource } from './volunteer.api'
import { MockVolunteerDataSource } from './volunteer.mock'
import type { MemberActivitiesDataSource } from './registrations.datasource'
import { ApiMemberActivitiesDataSource } from './registrations.api'
import { MockMemberActivitiesDataSource } from './registrations.mock'
import type { MatchingDataSource } from './matching.datasource'
import { ApiMatchingDataSource } from './matching.api'
import { MockMatchingDataSource } from './matching.mock'
import type { MemberAssignmentsDataSource } from './assignments.datasource'
import { ApiMemberAssignmentsDataSource } from './assignments.api'
import { MockMemberAssignmentsDataSource } from './assignments.mock'
import type { NotificationsDataSource } from './notifications.datasource'
import { ApiNotificationsDataSource } from './notifications.api'
import { MockNotificationsDataSource } from './notifications.mock'
import type { ProfileDataSource } from './profile.datasource'
import { ApiProfileDataSource } from './profile.api'
import { MockProfileDataSource } from './profile.mock'
import type { GamificationDataSource } from './gamification.datasource'
import { ApiGamificationDataSource } from './gamification.api'
import { MockGamificationDataSource } from './gamification.mock'
import type { GalleryDataSource } from './gallery.datasource'
import { ApiGalleryDataSource } from './gallery.api'
import { MockGalleryDataSource } from './gallery.mock'
import type { FeedDataSource } from './feed.datasource'
import { ApiFeedDataSource } from './feed.api'
import { MockFeedDataSource } from './feed.mock'

type DataSourceMode = 'mock' | 'api'

const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'

let activitiesDataSource: ActivitiesDataSource | null = null
let volunteerDataSource: VolunteerDataSource | null = null
let memberActivitiesDataSource: MemberActivitiesDataSource | null = null
let matchingDataSource: MatchingDataSource | null = null
let memberAssignmentsDataSource: MemberAssignmentsDataSource | null = null
let notificationsDataSource: NotificationsDataSource | null = null
let profileDataSource: ProfileDataSource | null = null
let gamificationDataSource: GamificationDataSource | null = null
let galleryDataSource: GalleryDataSource | null = null
let feedDataSource: FeedDataSource | null = null

export function getActivitiesDataSource(): ActivitiesDataSource {
  if (!activitiesDataSource) {
    activitiesDataSource =
      mode === 'api' ? new ApiActivitiesDataSource() : new MockActivitiesDataSource()
  }
  return activitiesDataSource
}

export function getVolunteerDataSource(): VolunteerDataSource {
  if (!volunteerDataSource) {
    volunteerDataSource =
      mode === 'api' ? new ApiVolunteerDataSource() : new MockVolunteerDataSource()
  }
  return volunteerDataSource
}

export function getMemberActivitiesDataSource(): MemberActivitiesDataSource {
  if (!memberActivitiesDataSource) {
    memberActivitiesDataSource =
      mode === 'api' ? new ApiMemberActivitiesDataSource() : new MockMemberActivitiesDataSource()
  }
  return memberActivitiesDataSource
}

export function getMatchingDataSource(): MatchingDataSource {
  if (!matchingDataSource) {
    matchingDataSource = mode === 'api' ? new ApiMatchingDataSource() : new MockMatchingDataSource()
  }
  return matchingDataSource
}

export function getMemberAssignmentsDataSource(): MemberAssignmentsDataSource {
  if (!memberAssignmentsDataSource) {
    memberAssignmentsDataSource =
      mode === 'api' ? new ApiMemberAssignmentsDataSource() : new MockMemberAssignmentsDataSource()
  }
  return memberAssignmentsDataSource
}

export function getNotificationsDataSource(): NotificationsDataSource {
  if (!notificationsDataSource) {
    notificationsDataSource =
      mode === 'api' ? new ApiNotificationsDataSource() : new MockNotificationsDataSource()
  }
  return notificationsDataSource
}

export function getProfileDataSource(): ProfileDataSource {
  if (!profileDataSource) {
    profileDataSource = mode === 'api' ? new ApiProfileDataSource() : new MockProfileDataSource()
  }
  return profileDataSource
}

export function getGamificationDataSource(): GamificationDataSource {
  if (!gamificationDataSource) {
    gamificationDataSource =
      mode === 'api' ? new ApiGamificationDataSource() : new MockGamificationDataSource()
  }
  return gamificationDataSource
}

export function getGalleryDataSource(): GalleryDataSource {
  if (!galleryDataSource) {
    galleryDataSource = mode === 'api' ? new ApiGalleryDataSource() : new MockGalleryDataSource()
  }
  return galleryDataSource
}

export function getFeedDataSource(): FeedDataSource {
  if (!feedDataSource) {
    feedDataSource = mode === 'api' ? new ApiFeedDataSource() : new MockFeedDataSource()
  }
  return feedDataSource
}

// ── Domain getters consolidated from previously-flat files ────────────────────
// Pattern: Strategy (interface) + Factory (env-based dispatch). Singleton state
// lives only here so each domain has exactly one source of dispatch.

import type { ShopDataSource } from './shop.datasource'
import { ApiShopDataSource } from './shop.api'
import { MockShopDataSource } from './shop.mock'
import type { ArticlesDataSource } from './articles.datasource'
import { ApiArticlesDataSource } from './articles.api'
import { MockArticlesDataSource } from './articles.mock'
import type { CampaignsDataSource } from './campaigns.datasource'
import { ApiCampaignsDataSource } from './campaigns.api'
import { MockCampaignsDataSource } from './campaigns.mock'
import type { ReportsDataSource } from './reports.datasource'
import { ApiReportsDataSource } from './reports.api'
import { MockReportsDataSource } from './reports.mock'
import type { InvitesDataSource } from './invites.datasource'
import { ApiInvitesDataSource } from './invites.api'
import { MockInvitesDataSource } from './invites.mock'
import type { AuthDataSource } from './auth.datasource'
import { ApiAuthDataSource } from './auth.api'
import { MockAuthDataSource } from './auth.mock'

let shopDataSource: ShopDataSource | null = null
let articlesDataSource: ArticlesDataSource | null = null
let campaignsDataSource: CampaignsDataSource | null = null
let reportsDataSource: ReportsDataSource | null = null
let invitesDataSource: InvitesDataSource | null = null
let authDataSource: AuthDataSource | null = null

export function getShopDataSource(): ShopDataSource {
  if (!shopDataSource) {
    shopDataSource = mode === 'api' ? new ApiShopDataSource() : new MockShopDataSource()
  }
  return shopDataSource
}

export function getArticlesDataSource(): ArticlesDataSource {
  if (!articlesDataSource) {
    articlesDataSource = mode === 'api' ? new ApiArticlesDataSource() : new MockArticlesDataSource()
  }
  return articlesDataSource
}

export function getCampaignsDataSource(): CampaignsDataSource {
  if (!campaignsDataSource) {
    campaignsDataSource =
      mode === 'api' ? new ApiCampaignsDataSource() : new MockCampaignsDataSource()
  }
  return campaignsDataSource
}

export function getReportsDataSource(): ReportsDataSource {
  if (!reportsDataSource) {
    reportsDataSource = mode === 'api' ? new ApiReportsDataSource() : new MockReportsDataSource()
  }
  return reportsDataSource
}

export function getInvitesDataSource(): InvitesDataSource {
  if (!invitesDataSource) {
    invitesDataSource = mode === 'api' ? new ApiInvitesDataSource() : new MockInvitesDataSource()
  }
  return invitesDataSource
}

export function getAuthDataSource(): AuthDataSource {
  if (!authDataSource) {
    authDataSource = mode === 'api' ? new ApiAuthDataSource() : new MockAuthDataSource()
  }
  return authDataSource
}
