import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ActivityStatus, OrderStatus } from '@prisma/client'
import { CACHE_KEY, CacheService } from '../../common/cache'
import { ReportsOverviewQueryDto } from './dto/reports-overview-query.dto'
import {
  ActivityReportRow,
  OrderReportRow,
  REPORTS_REPOSITORY,
  ReportsRepository,
} from './reports.repository'

const REPORTS_DASHBOARD_TTL_SECONDS = 30
const REPORTS_OVERVIEW_TTL_SECONDS = 60
const ACTIVITY_STATUSES: ActivityStatus[] = ['DRAFT', 'OPEN', 'CLOSED', 'MATCHED', 'COMPLETED']
const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT_REVIEW',
  'CONFIRMED',
  'REJECTED',
  'DELIVERED',
  'CANCELLED',
]

export interface ReportsDashboardResponse {
  generatedAt: string
  kpis: {
    totalUsers: number
    activeUsers: number
    totalActivities: number
    openActivities: number
    completedActivities: number
    totalRegistrations: number
    totalAssignments: number
    pendingApplications: number
    totalApplications: number
    totalOrders: number
    confirmedOrders: number
    deliveredOrders: number
    revenueCents: number
  }
  breakdowns: {
    activitiesByStatus: { status: string; count: number }[]
    ordersByStatus: { status: string; count: number }[]
  }
}

export type ReportsOverviewItem =
  | (Omit<ActivityReportRow, 'startTime' | 'endTime'> & { startTime: string; endTime: string })
  | (Omit<OrderReportRow, 'createdAt'> & { createdAt: string })

export interface ReportsOverviewResponse {
  generatedAt: string
  dataset: 'activities' | 'orders'
  filters: {
    status?: string
    from?: string
    to?: string
  }
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  summary: {
    rowCount: number
    totalCents?: number
    totalRegistrations?: number
    totalAssignments?: number
  }
  items: ReportsOverviewItem[]
}

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly repo: ReportsRepository,
    private readonly cache: CacheService,
  ) {}

  async dashboard(): Promise<ReportsDashboardResponse> {
    return this.cache.getOrSet(
      CACHE_KEY.reportsDashboard(),
      async () => {
        const [counts, orders, activityStatuses, orderStatuses] = await Promise.all([
          this.repo.getDashboardCounts(),
          this.repo.getOrdersAggregate(),
          this.repo.getActivityStatusBreakdown(),
          this.repo.getOrderStatusBreakdown(),
        ])

        return {
          generatedAt: new Date().toISOString(),
          kpis: { ...counts, ...orders },
          breakdowns: {
            activitiesByStatus: normalizeBuckets(ACTIVITY_STATUSES, activityStatuses),
            ordersByStatus: normalizeBuckets(ORDER_STATUSES, orderStatuses),
          },
        }
      },
      REPORTS_DASHBOARD_TTL_SECONDS,
    )
  }

  async overview(query: ReportsOverviewQueryDto): Promise<ReportsOverviewResponse> {
    const normalized = this.normalizeOverviewQuery(query)
    return this.cache.getOrSet(
      CACHE_KEY.reportsOverview(this.overviewCacheKey(normalized)),
      () => this.buildOverview(normalized),
      REPORTS_OVERVIEW_TTL_SECONDS,
    )
  }

  async overviewCsv(query: ReportsOverviewQueryDto): Promise<string> {
    const overview = await this.overview({ ...query, page: 1, pageSize: 100 })
    if (overview.dataset === 'orders') {
      return csv([
        ['id', 'customerName', 'status', 'itemCount', 'totalCents', 'createdAt'],
        ...overview.items.map((item) => {
          const row = item as Omit<OrderReportRow, 'createdAt'> & { createdAt: string }
          return [
            row.id,
            row.customerName,
            row.status,
            row.itemCount,
            row.totalCents,
            row.createdAt,
          ]
        }),
      ])
    }

    return csv([
      [
        'id',
        'title',
        'status',
        'startTime',
        'endTime',
        'taskCount',
        'registrationCount',
        'assignmentCount',
      ],
      ...overview.items.map((item) => {
        const row = item as Omit<ActivityReportRow, 'startTime' | 'endTime'> & {
          startTime: string
          endTime: string
        }
        return [
          row.id,
          row.title,
          row.status,
          row.startTime,
          row.endTime,
          row.taskCount,
          row.registrationCount,
          row.assignmentCount,
        ]
      }),
    ])
  }

  private async buildOverview(query: ReportsOverviewQueryDto): Promise<ReportsOverviewResponse> {
    const skip = (query.page - 1) * query.pageSize
    if (query.dataset === 'orders') {
      const status = this.orderStatus(query.status)
      const result = await this.repo.findOrderRows({
        status,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        skip,
        take: query.pageSize,
      })
      const items = result.items.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
      return this.overviewResponse(query, result.total, items, {
        rowCount: result.total,
        totalCents: result.items.reduce((sum, row) => sum + row.totalCents, 0),
      })
    }

    const status = this.activityStatus(query.status)
    const result = await this.repo.findActivityRows({
      status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      skip,
      take: query.pageSize,
    })
    const items = result.items.map((row) => ({
      ...row,
      startTime: row.startTime.toISOString(),
      endTime: row.endTime.toISOString(),
    }))
    return this.overviewResponse(query, result.total, items, {
      rowCount: result.total,
      totalRegistrations: result.items.reduce((sum, row) => sum + row.registrationCount, 0),
      totalAssignments: result.items.reduce((sum, row) => sum + row.assignmentCount, 0),
    })
  }

  private overviewResponse(
    query: ReportsOverviewQueryDto,
    total: number,
    items: ReportsOverviewItem[],
    summary: ReportsOverviewResponse['summary'],
  ): ReportsOverviewResponse {
    return {
      generatedAt: new Date().toISOString(),
      dataset: query.dataset,
      filters: { status: query.status, from: query.from, to: query.to },
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
      summary,
      items,
    }
  }

  private normalizeOverviewQuery(query: ReportsOverviewQueryDto): ReportsOverviewQueryDto {
    return {
      dataset: query.dataset ?? 'activities',
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      status: query.status,
      from: query.from,
      to: query.to,
    }
  }

  private overviewCacheKey(query: ReportsOverviewQueryDto): string {
    return [
      query.dataset,
      query.page,
      query.pageSize,
      query.status ?? '',
      query.from ?? '',
      query.to ?? '',
    ]
      .map((part) => encodeURIComponent(String(part)))
      .join(':')
  }

  private activityStatus(status?: string): ActivityStatus | undefined {
    if (!status) return undefined
    if (!ACTIVITY_STATUSES.includes(status as ActivityStatus)) {
      throw new UnprocessableEntityException('Invalid activity report status')
    }
    return status as ActivityStatus
  }

  private orderStatus(status?: string): OrderStatus | undefined {
    if (!status) return undefined
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new UnprocessableEntityException('Invalid order report status')
    }
    return status as OrderStatus
  }
}

function normalizeBuckets<T extends string>(
  statuses: readonly T[],
  buckets: { status: string; count: number }[],
): { status: T; count: number }[] {
  return statuses.map((status) => ({
    status,
    count: buckets.find((bucket) => bucket.status === status)?.count ?? 0,
  }))
}

function csv(rows: (string | number)[][]): string {
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

function csvCell(value: string | number): string {
  const raw = String(value)
  if (!/[",\n]/.test(raw)) return raw
  return `"${raw.replace(/"/g, '""')}"`
}
