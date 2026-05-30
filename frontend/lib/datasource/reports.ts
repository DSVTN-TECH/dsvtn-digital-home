import { apiFetch } from '@/lib/api'
import { MockReportsDataSource } from '@/lib/mock/reports'

export interface ReportsDashboardKpis {
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

export interface StatusBucket {
  status: string
  count: number
}

export interface ReportsDashboard {
  generatedAt: string
  kpis: ReportsDashboardKpis
  breakdowns: {
    activitiesByStatus: StatusBucket[]
    ordersByStatus: StatusBucket[]
  }
}

export type ReportDataset = 'activities' | 'orders'

export interface ReportsOverviewFilters {
  dataset: ReportDataset
  page: number
  pageSize: number
  status?: string
  from?: string
  to?: string
}

export interface ActivityReportRow {
  id: string
  title: string
  status: string
  startTime: string
  endTime: string
  taskCount: number
  registrationCount: number
  assignmentCount: number
}

export interface OrderReportRow {
  id: string
  customerName: string
  status: string
  itemCount: number
  totalCents: number
  createdAt: string
}

export type ReportRow = ActivityReportRow | OrderReportRow

export interface ReportsOverview {
  generatedAt: string
  dataset: ReportDataset
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
  items: ReportRow[]
}

export interface ReportsDataSource {
  getDashboard(): Promise<ReportsDashboard>
  getOverview(filters: ReportsOverviewFilters): Promise<ReportsOverview>
}

export function isOrderRow(row: ReportRow): row is OrderReportRow {
  return (row as OrderReportRow).customerName !== undefined
}

function buildOverviewQuery(filters: ReportsOverviewFilters): string {
  const params = new URLSearchParams()
  params.set('dataset', filters.dataset)
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.status) params.set('status', filters.status)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  return params.toString()
}

export class ApiReportsDataSource implements ReportsDataSource {
  async getDashboard(): Promise<ReportsDashboard> {
    return apiFetch<ReportsDashboard>('/admin/reports/dashboard')
  }

  async getOverview(filters: ReportsOverviewFilters): Promise<ReportsOverview> {
    return apiFetch<ReportsOverview>(`/admin/reports/overview?${buildOverviewQuery(filters)}`)
  }
}

let reportsDataSource: ReportsDataSource | null = null

export function getReportsDataSource(): ReportsDataSource {
  if (!reportsDataSource) {
    const mode = (process.env.NEXT_PUBLIC_DATA_SOURCE as 'mock' | 'api') ?? 'mock'
    reportsDataSource = mode === 'api' ? new ApiReportsDataSource() : new MockReportsDataSource()
  }
  return reportsDataSource
}
