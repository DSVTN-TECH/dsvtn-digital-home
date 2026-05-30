import { Test } from '@nestjs/testing'
import { UnprocessableEntityException } from '@nestjs/common'
import { CacheService } from '../../common/cache'
import { ReportsService } from './reports.service'
import { REPORTS_REPOSITORY, ReportsRepository } from './reports.repository'

const baseCounts = {
  totalUsers: 10,
  activeUsers: 8,
  totalActivities: 5,
  openActivities: 2,
  completedActivities: 1,
  totalRegistrations: 12,
  totalAssignments: 7,
  pendingApplications: 3,
  totalApplications: 9,
}

const baseOrders = {
  totalOrders: 6,
  confirmedOrders: 2,
  deliveredOrders: 3,
  revenueCents: 150000,
}

describe('ReportsService', () => {
  let service: ReportsService
  let repo: jest.Mocked<ReportsRepository>
  let cache: { getOrSet: jest.Mock; invalidate: jest.Mock; invalidateByPrefix: jest.Mock }

  beforeEach(async () => {
    repo = {
      getDashboardCounts: jest.fn().mockResolvedValue(baseCounts),
      getOrdersAggregate: jest.fn().mockResolvedValue(baseOrders),
      getActivityStatusBreakdown: jest.fn().mockResolvedValue([{ status: 'OPEN', count: 2 }]),
      getOrderStatusBreakdown: jest.fn().mockResolvedValue([{ status: 'CONFIRMED', count: 2 }]),
      findActivityRows: jest.fn().mockResolvedValue({
        total: 1,
        items: [
          {
            id: 'a1',
            title: 'Act One',
            status: 'OPEN',
            startTime: new Date('2026-10-01T08:00:00Z'),
            endTime: new Date('2026-10-01T17:00:00Z'),
            taskCount: 2,
            registrationCount: 4,
            assignmentCount: 3,
          },
        ],
      }),
      findOrderRows: jest.fn().mockResolvedValue({
        total: 1,
        items: [
          {
            id: 'o1',
            customerName: 'Buyer, Inc',
            status: 'CONFIRMED',
            itemCount: 2,
            totalCents: 50000,
            createdAt: new Date('2026-10-02T10:00:00Z'),
          },
        ],
      }),
    } as unknown as jest.Mocked<ReportsRepository>

    cache = {
      getOrSet: jest.fn(async (_key: string, factory: () => Promise<unknown>) => factory()),
      invalidate: jest.fn().mockResolvedValue(1),
      invalidateByPrefix: jest.fn().mockResolvedValue(1),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: REPORTS_REPOSITORY, useValue: repo },
        { provide: CacheService, useValue: cache },
      ],
    }).compile()

    service = moduleRef.get(ReportsService)
  })

  it('aggregates dashboard KPIs and normalizes status breakdowns', async () => {
    const result = await service.dashboard()

    expect(result.kpis.totalUsers).toBe(10)
    expect(result.kpis.revenueCents).toBe(150000)
    expect(result.breakdowns.activitiesByStatus).toEqual([
      { status: 'DRAFT', count: 0 },
      { status: 'OPEN', count: 2 },
      { status: 'CLOSED', count: 0 },
      { status: 'MATCHED', count: 0 },
      { status: 'COMPLETED', count: 0 },
    ])
    expect(cache.getOrSet).toHaveBeenCalledWith('cache:reports:dashboard', expect.any(Function), 30)
  })

  it('builds activity overview with pagination and summary math', async () => {
    const result = await service.overview({ dataset: 'activities', page: 1, pageSize: 20 })

    expect(result.dataset).toBe('activities')
    expect(result.pagination).toMatchObject({ page: 1, pageSize: 20, total: 1, totalPages: 1 })
    expect(result.summary.totalRegistrations).toBe(4)
    expect(result.summary.totalAssignments).toBe(3)
    expect(result.items[0]).toMatchObject({ id: 'a1', startTime: '2026-10-01T08:00:00.000Z' })
  })

  it('builds order overview and totals revenue cents', async () => {
    const result = await service.overview({ dataset: 'orders', page: 1, pageSize: 20 })

    expect(result.dataset).toBe('orders')
    expect(result.summary.totalCents).toBe(50000)
    expect(result.items[0]).toMatchObject({ id: 'o1', createdAt: '2026-10-02T10:00:00.000Z' })
  })

  it('rejects an invalid status filter', async () => {
    await expect(
      service.overview({ dataset: 'orders', page: 1, pageSize: 20, status: 'NOPE' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('exports CSV escaping cells with commas', async () => {
    const csv = await service.overviewCsv({ dataset: 'orders', page: 1, pageSize: 20 })

    expect(csv).toContain('id,customerName,status,itemCount,totalCents,createdAt')
    expect(csv).toContain('"Buyer, Inc"')
  })
})
