import { apiFetch } from '@/lib/api'
import { MockCampaignsDataSource } from '@/lib/mock/campaigns'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'
export type OrderStatus =
  | 'PENDING_PAYMENT_REVIEW'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface CampaignProgress {
  raisedCents: number
  orderCount: number
  percent: number
}

export interface CampaignWithProgress {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  goalCents: number
  startDate: string
  endDate: string
  status: CampaignStatus
  progress: CampaignProgress
}

export interface FundraisingTransaction {
  id: string
  customerName: string
  status: OrderStatus
  campaignId: string | null
  totalCents: number
  itemCount: number
  createdAt: string
}

export interface PaginatedTransactions {
  items: FundraisingTransaction[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface TransactionFilters {
  page: number
  pageSize: number
  status?: OrderStatus
  campaignId?: string
}

export interface CampaignsDataSource {
  listPublic(): Promise<CampaignWithProgress[]>
  listTransactions(filters: TransactionFilters): Promise<PaginatedTransactions>
}

function transactionsQuery(filters: TransactionFilters): string {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.status) params.set('status', filters.status)
  if (filters.campaignId) params.set('campaignId', filters.campaignId)
  return params.toString()
}

export class ApiCampaignsDataSource implements CampaignsDataSource {
  async listPublic(): Promise<CampaignWithProgress[]> {
    return apiFetch<CampaignWithProgress[]>('/public/campaigns')
  }

  async listTransactions(filters: TransactionFilters): Promise<PaginatedTransactions> {
    return apiFetch<PaginatedTransactions>(
      `/admin/fundraising/transactions?${transactionsQuery(filters)}`,
    )
  }
}

let campaignsDataSource: CampaignsDataSource | null = null

export function getCampaignsDataSource(): CampaignsDataSource {
  if (!campaignsDataSource) {
    const mode = (process.env.NEXT_PUBLIC_DATA_SOURCE as 'mock' | 'api') ?? 'mock'
    campaignsDataSource =
      mode === 'api' ? new ApiCampaignsDataSource() : new MockCampaignsDataSource()
  }
  return campaignsDataSource
}
