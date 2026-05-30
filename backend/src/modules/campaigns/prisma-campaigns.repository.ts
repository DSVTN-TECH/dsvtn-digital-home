import { Injectable } from '@nestjs/common'
import { Campaign, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CampaignListFilter,
  CampaignProgress,
  CampaignsRepository,
  CreateCampaignData,
  PagedResult,
  REVENUE_STATUSES,
  TransactionFilter,
  TransactionRow,
  UpdateCampaignData,
} from './campaigns.repository'

@Injectable()
export class PrismaCampaignsRepository extends CampaignsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async list(filter: CampaignListFilter): Promise<PagedResult<Campaign>> {
    const where: Prisma.CampaignWhereInput = {}
    if (filter.status) where.status = filter.status

    const [items, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter.skip,
        take: filter.take,
      }),
      this.prisma.campaign.count({ where }),
    ])
    return { items, total }
  }

  async listActive(): Promise<Campaign[]> {
    return this.prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'desc' },
    })
  }

  async findById(id: string): Promise<Campaign | null> {
    return this.prisma.campaign.findUnique({ where: { id } })
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    return this.prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        goalCents: data.goalCents,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status ?? 'DRAFT',
      },
    })
  }

  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    return this.prisma.campaign.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        goalCents: data.goalCents,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
    })
  }

  async getProgress(campaignId: string): Promise<CampaignProgress> {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: { campaignId, status: { in: REVENUE_STATUSES } },
      },
      select: { quantity: true, unitPriceCents: true, orderId: true },
    })
    const raisedCents = items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0)
    const orderCount = new Set(items.map((item) => item.orderId)).size
    return { raisedCents, orderCount }
  }

  async getProgressMany(campaignIds: string[]): Promise<Map<string, CampaignProgress>> {
    const result = new Map<string, CampaignProgress>()
    if (campaignIds.length === 0) return result

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: { campaignId: { in: campaignIds }, status: { in: REVENUE_STATUSES } },
      },
      select: {
        quantity: true,
        unitPriceCents: true,
        orderId: true,
        order: { select: { campaignId: true } },
      },
    })

    const ordersByCampaign = new Map<string, Set<string>>()
    for (const id of campaignIds) {
      result.set(id, { raisedCents: 0, orderCount: 0 })
      ordersByCampaign.set(id, new Set())
    }

    for (const item of items) {
      const campaignId = item.order.campaignId
      if (!campaignId) continue
      const progress = result.get(campaignId)
      if (!progress) continue
      progress.raisedCents += item.quantity * item.unitPriceCents
      ordersByCampaign.get(campaignId)?.add(item.orderId)
    }

    for (const [id, orders] of ordersByCampaign.entries()) {
      const progress = result.get(id)
      if (progress) progress.orderCount = orders.size
    }

    return result
  }

  async listTransactions(filter: TransactionFilter): Promise<PagedResult<TransactionRow>> {
    const where: Prisma.OrderWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.campaignId) where.campaignId = filter.campaignId

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter.skip,
        take: filter.take,
        select: {
          id: true,
          customerName: true,
          status: true,
          campaignId: true,
          createdAt: true,
          items: { select: { quantity: true, unitPriceCents: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      total,
      items: orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        campaignId: order.campaignId,
        createdAt: order.createdAt,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        totalCents: order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
      })),
    }
  }
}
