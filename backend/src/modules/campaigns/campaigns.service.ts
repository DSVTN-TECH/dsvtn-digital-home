import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Campaign, OrderStatus } from '@prisma/client'
import { CACHE_KEY, CacheService } from '../../common/cache'
import { CAMPAIGNS_REPOSITORY, CampaignProgress, CampaignsRepository } from './campaigns.repository'
import {
  CreateCampaignDto,
  ListCampaignsQueryDto,
  ListTransactionsQueryDto,
  UpdateCampaignDto,
} from './dto/campaigns.dto'

const CAMPAIGN_CACHE_TTL_SECONDS = 60
const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT_REVIEW',
  'CONFIRMED',
  'REJECTED',
  'DELIVERED',
  'CANCELLED',
]

export interface CampaignWithProgress {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  goalCents: number
  startDate: string
  endDate: string
  status: Campaign['status']
  progress: {
    raisedCents: number
    orderCount: number
    percent: number
  }
}

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(CAMPAIGNS_REPOSITORY) private readonly repo: CampaignsRepository,
    private readonly cache: CacheService,
  ) {}

  async listPublic(): Promise<CampaignWithProgress[]> {
    return this.cache.getOrSet(
      CACHE_KEY.campaignPublic('list'),
      async () => {
        const campaigns = await this.repo.listActive()
        const progress = await this.repo.getProgressMany(campaigns.map((c) => c.id))
        return campaigns.map((campaign) =>
          this.toPublic(campaign, progress.get(campaign.id) ?? { raisedCents: 0, orderCount: 0 }),
        )
      },
      CAMPAIGN_CACHE_TTL_SECONDS,
    )
  }

  async getPublic(id: string): Promise<CampaignWithProgress> {
    const cached = await this.cache.getOrSet(
      CACHE_KEY.campaignPublic(id),
      async () => {
        const campaign = await this.repo.findById(id)
        if (!campaign || campaign.status !== 'ACTIVE') return null
        const progress = await this.repo.getProgress(id)
        return this.toPublic(campaign, progress)
      },
      CAMPAIGN_CACHE_TTL_SECONDS,
    )
    if (!cached) throw new NotFoundException('Campaign not found')
    return cached
  }

  async listAdmin(query: ListCampaignsQueryDto) {
    const skip = (query.page - 1) * query.pageSize
    const result = await this.repo.list({ status: query.status, skip, take: query.pageSize })
    const progress = await this.repo.getProgressMany(result.items.map((c) => c.id))
    return {
      items: result.items.map((campaign) =>
        this.toPublic(campaign, progress.get(campaign.id) ?? { raisedCents: 0, orderCount: 0 }),
      ),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    }
  }

  async create(dto: CreateCampaignDto) {
    const { startDate, endDate } = this.parseDates(dto.startDate, dto.endDate)
    const campaign = await this.repo.create({
      title: dto.title,
      description: dto.description,
      coverImageUrl: dto.coverImageUrl,
      goalCents: dto.goalCents,
      startDate,
      endDate,
      status: dto.status,
    })
    await this.invalidate()
    return campaign
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Campaign not found')

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate
    if (endDate < startDate) {
      throw new UnprocessableEntityException('endDate must be on or after startDate')
    }

    const campaign = await this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      coverImageUrl: dto.coverImageUrl,
      goalCents: dto.goalCents,
      startDate: dto.startDate ? startDate : undefined,
      endDate: dto.endDate ? endDate : undefined,
      status: dto.status,
    })
    await this.invalidate(id)
    return campaign
  }

  async listTransactions(query: ListTransactionsQueryDto) {
    const status = this.orderStatus(query.status)
    const skip = (query.page - 1) * query.pageSize
    const result = await this.repo.listTransactions({
      status,
      campaignId: query.campaignId,
      skip,
      take: query.pageSize,
    })
    return {
      items: result.items.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    }
  }

  async invalidate(id?: string): Promise<void> {
    await this.cache.invalidateByPrefix(CACHE_KEY.campaignPublicPrefix())
    if (id) await this.cache.invalidate(CACHE_KEY.campaignPublic(id))
  }

  private toPublic(campaign: Campaign, progress: CampaignProgress): CampaignWithProgress {
    const percent =
      campaign.goalCents > 0
        ? Math.min(100, Math.round((progress.raisedCents / campaign.goalCents) * 100))
        : 0
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      coverImageUrl: campaign.coverImageUrl,
      goalCents: campaign.goalCents,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      status: campaign.status,
      progress: { raisedCents: progress.raisedCents, orderCount: progress.orderCount, percent },
    }
  }

  private parseDates(start: string, end: string) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (endDate < startDate) {
      throw new UnprocessableEntityException('endDate must be on or after startDate')
    }
    return { startDate, endDate }
  }

  private orderStatus(status?: string): OrderStatus | undefined {
    if (!status) return undefined
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new UnprocessableEntityException('Invalid order status filter')
    }
    return status as OrderStatus
  }
}
