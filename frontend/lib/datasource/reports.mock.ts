import { mockReportActivities, mockReportOrders } from '@/lib/mock/reports'
import type {
  ActivityReportRow,
  OrderReportRow,
  ReportsDashboard,
  ReportsDataSource,
  ReportsOverview,
  ReportsOverviewFilters,
} from './reports.datasource'

export class MockReportsDataSource implements ReportsDataSource {
  async getDashboard(): Promise<ReportsDashboard> {
    return Promise.resolve({
      generatedAt: new Date().toISOString(),
      kpis: {
        totalUsers: 124,
        activeUsers: 112,
        totalActivities: 18,
        openActivities: 3,
        completedActivities: 9,
        totalRegistrations: 286,
        totalAssignments: 214,
        pendingApplications: 7,
        totalApplications: 58,
        totalOrders: 42,
        confirmedOrders: 18,
        deliveredOrders: 14,
        revenueCents: 7820000,
      },
      breakdowns: {
        activitiesByStatus: [
          { status: 'DRAFT', count: 2 },
          { status: 'OPEN', count: 3 },
          { status: 'CLOSED', count: 2 },
          { status: 'MATCHED', count: 2 },
          { status: 'COMPLETED', count: 9 },
        ],
        ordersByStatus: [
          { status: 'PENDING_PAYMENT_REVIEW', count: 5 },
          { status: 'CONFIRMED', count: 18 },
          { status: 'REJECTED', count: 2 },
          { status: 'DELIVERED', count: 14 },
          { status: 'CANCELLED', count: 3 },
        ],
      },
    })
  }

  async getOverview(filters: ReportsOverviewFilters): Promise<ReportsOverview> {
    const allItems = filters.dataset === 'orders' ? mockReportOrders : mockReportActivities
    const filtered = filters.status
      ? allItems.filter((item) => item.status === filters.status)
      : allItems
    const offset = (filters.page - 1) * filters.pageSize
    const items = filtered.slice(offset, offset + filters.pageSize)
    return Promise.resolve({
      generatedAt: new Date().toISOString(),
      dataset: filters.dataset,
      filters: { status: filters.status, from: filters.from, to: filters.to },
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / filters.pageSize),
      },
      summary:
        filters.dataset === 'orders'
          ? {
              rowCount: filtered.length,
              totalCents: (items as OrderReportRow[]).reduce(
                (sum, item) => sum + item.totalCents,
                0,
              ),
            }
          : {
              rowCount: filtered.length,
              totalRegistrations: (items as ActivityReportRow[]).reduce(
                (sum, item) => sum + item.registrationCount,
                0,
              ),
              totalAssignments: (items as ActivityReportRow[]).reduce(
                (sum, item) => sum + item.assignmentCount,
                0,
              ),
            },
      items,
    })
  }
}
