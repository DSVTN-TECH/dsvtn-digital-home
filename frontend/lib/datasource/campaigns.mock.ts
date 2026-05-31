import { mockCampaigns, mockTransactions } from '@/lib/mock/campaigns'
import type {
  CampaignsDataSource,
  CampaignWithProgress,
  PaginatedTransactions,
  TransactionFilters,
} from './campaigns.datasource'

export class MockCampaignsDataSource implements CampaignsDataSource {
  async listPublic(): Promise<CampaignWithProgress[]> {
    return Promise.resolve(mockCampaigns.filter((campaign) => campaign.status === 'ACTIVE'))
  }

  async listTransactions(filters: TransactionFilters): Promise<PaginatedTransactions> {
    let items = [...mockTransactions]
    if (filters.status) items = items.filter((tx) => tx.status === filters.status)
    if (filters.campaignId) items = items.filter((tx) => tx.campaignId === filters.campaignId)
    const total = items.length
    const offset = (filters.page - 1) * filters.pageSize
    const paged = items.slice(offset, offset + filters.pageSize)
    return Promise.resolve({
      items: paged,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    })
  }
}
