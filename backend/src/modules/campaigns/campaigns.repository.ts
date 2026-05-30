import { Campaign, CampaignStatus, OrderStatus } from '@prisma/client'

export const CAMPAIGNS_REPOSITORY = Symbol('CAMPAIGNS_REPOSITORY')

const REVENUE_STATUSES: OrderStatus[] = ['CONFIRMED', 'DELIVERED']
export { REVENUE_STATUSES }

export interface CreateCampaignData {
  title: string
  description?: string | null
  coverImageUrl?: string | null
  goalCents: number
  startDate: Date
  endDate: Date
  status?: CampaignStatus
}

export interface UpdateCampaignData {
  title?: string
  description?: string | null
  coverImageUrl?: string | null
  goalCents?: number
  startDate?: Date
  endDate?: Date
  status?: CampaignStatus
}

export interface CampaignProgress {
  raisedCents: number
  orderCount: number
}

export interface TransactionRow {
  id: string
  customerName: string
  status: OrderStatus
  campaignId: string | null
  totalCents: number
  itemCount: number
  createdAt: Date
}

export interface TransactionFilter {
  status?: OrderStatus
  campaignId?: string
  skip: number
  take: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
}

export interface CampaignListFilter {
  status?: CampaignStatus
  skip: number
  take: number
}

export abstract class CampaignsRepository {
  abstract list(filter: CampaignListFilter): Promise<PagedResult<Campaign>>
  abstract listActive(): Promise<Campaign[]>
  abstract findById(id: string): Promise<Campaign | null>
  abstract create(data: CreateCampaignData): Promise<Campaign>
  abstract update(id: string, data: UpdateCampaignData): Promise<Campaign>
  abstract getProgress(campaignId: string): Promise<CampaignProgress>
  abstract getProgressMany(campaignIds: string[]): Promise<Map<string, CampaignProgress>>
  abstract listTransactions(filter: TransactionFilter): Promise<PagedResult<TransactionRow>>
}
