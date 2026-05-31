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
  filters: { status?: string; from?: string; to?: string }
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
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
