import type {
  CampaignWithProgress,
  FundraisingTransaction,
} from '@/lib/datasource/campaigns.datasource'

export const mockCampaigns: CampaignWithProgress[] = [
  {
    id: 'mock-campaign-1',
    title: 'Áo polo gây quỹ Mùa Hè Xanh 2026',
    description: 'Toàn bộ lợi nhuận dành cho quỹ học bổng học sinh vùng sâu.',
    coverImageUrl: null,
    goalCents: 20000000,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
    status: 'ACTIVE',
    progress: { raisedCents: 12500000, orderCount: 86, percent: 63 },
  },
  {
    id: 'mock-campaign-2',
    title: 'Sổ tay tình nguyện viên',
    description: 'Gây quỹ in sổ tay và vật tư cho các đội hình.',
    coverImageUrl: null,
    goalCents: 8000000,
    startDate: '2026-05-01T00:00:00.000Z',
    endDate: '2026-06-15T00:00:00.000Z',
    status: 'ACTIVE',
    progress: { raisedCents: 8000000, orderCount: 64, percent: 100 },
  },
]

export const mockTransactions: FundraisingTransaction[] = [
  {
    id: 'mock-tx-1',
    customerName: 'Nguyễn An',
    status: 'CONFIRMED',
    campaignId: 'mock-campaign-1',
    totalCents: 250000,
    itemCount: 2,
    createdAt: '2026-06-05T08:00:00.000Z',
  },
  {
    id: 'mock-tx-2',
    customerName: 'Trần Bình',
    status: 'DELIVERED',
    campaignId: 'mock-campaign-1',
    totalCents: 125000,
    itemCount: 1,
    createdAt: '2026-06-06T09:30:00.000Z',
  },
  {
    id: 'mock-tx-3',
    customerName: 'Lê Chi',
    status: 'PENDING_PAYMENT_REVIEW',
    campaignId: 'mock-campaign-2',
    totalCents: 375000,
    itemCount: 3,
    createdAt: '2026-06-07T10:15:00.000Z',
  },
]
