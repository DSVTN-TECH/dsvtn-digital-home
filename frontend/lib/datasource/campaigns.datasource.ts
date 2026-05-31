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
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
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
