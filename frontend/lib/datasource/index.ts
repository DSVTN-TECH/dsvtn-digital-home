export type { ActivitiesDataSource } from './activities.datasource'
export type { VolunteerDataSource } from './volunteer.datasource'
export type { MemberActivitiesDataSource } from './registrations.datasource'
export type { MatchingDataSource } from './matching.datasource'
export type { MemberAssignmentsDataSource } from './assignments.datasource'
export type { NotificationsDataSource, NotificationItem } from './notifications.datasource'
export type { ProfileDataSource } from './profile.datasource'
export type { GamificationDataSource } from './gamification.datasource'
export type { GalleryDataSource } from './gallery.datasource'
export type { FeedDataSource, FeedItem } from './feed.datasource'

export type {
  ProductStatus,
  OrderStatus as ShopOrderStatus,
  Product,
  OrderItemInput,
  CreateOrderInput,
  CreateOrderResult,
  ProductFormInput,
  AdminOrder,
  ShopDataSource,
} from './shop.datasource'
export { ORDER_STATUSES, ALLOWED_ORDER_TRANSITIONS } from './shop.datasource'

export type {
  ArticleStatus,
  Article,
  ArticleFormInput,
  ArticlesDataSource,
} from './articles.datasource'
export { resolveSlug } from './articles.datasource'

export type {
  CampaignStatus,
  OrderStatus as CampaignOrderStatus,
  CampaignProgress,
  CampaignWithProgress,
  FundraisingTransaction,
  PaginatedTransactions,
  TransactionFilters,
  CampaignsDataSource,
} from './campaigns.datasource'

export type {
  ReportsDashboardKpis,
  StatusBucket,
  ReportsDashboard,
  ReportDataset,
  ReportsOverviewFilters,
  ActivityReportRow,
  OrderReportRow,
  ReportRow,
  ReportsOverview,
  ReportsDataSource,
} from './reports.datasource'
export { isOrderRow } from './reports.datasource'

export type {
  InviteRole,
  InviteStatus,
  InviteItem,
  CreateInviteInput,
  CreateInviteResponse,
  InvitesListResponse,
  AcceptInviteInput,
  InvitesDataSource,
} from './invites.datasource'

export type { AuthDataSource } from './auth.datasource'
export { MockAuthError } from '@/lib/mock/auth'

export {
  getActivitiesDataSource,
  getVolunteerDataSource,
  getMemberActivitiesDataSource,
  getMatchingDataSource,
  getMemberAssignmentsDataSource,
  getNotificationsDataSource,
  getProfileDataSource,
  getGamificationDataSource,
  getGalleryDataSource,
  getFeedDataSource,
  getShopDataSource,
  getArticlesDataSource,
  getCampaignsDataSource,
  getReportsDataSource,
  getInvitesDataSource,
  getAuthDataSource,
} from './factory'
