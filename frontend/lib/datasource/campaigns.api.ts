import { apiFetch } from '@/lib/api'
import type {
  CampaignsDataSource,
  CampaignWithProgress,
  PaginatedTransactions,
  TransactionFilters,
} from './campaigns.datasource'

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
