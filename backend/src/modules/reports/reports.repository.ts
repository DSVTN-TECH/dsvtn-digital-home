import { ActivityStatus, OrderStatus } from '@prisma/client'

export const REPORTS_REPOSITORY = Symbol('REPORTS_REPOSITORY')

export interface DateRangeFilter {
  from?: Date
  to?: Date
}

export interface DashboardCounts {
  totalUsers: number
  activeUsers: number
  totalActivities: number
  openActivities: number
  completedActivities: number
  totalRegistrations: number
  totalAssignments: number
  pendingApplications: number
  totalApplications: number
}

export interface OrdersAggregate {
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  revenueCents: number
}

export interface StatusBucket {
  status: string
  count: number
}

export interface ActivityReportRow {
  id: string
  title: string
  status: ActivityStatus
  startTime: Date
  endTime: Date
  taskCount: number
  registrationCount: number
  assignmentCount: number
}

export interface OrderReportRow {
  id: string
  customerName: string
  status: OrderStatus
  itemCount: number
  totalCents: number
  createdAt: Date
}

export interface PagedResult<T> {
  items: T[]
  total: number
}

export interface ActivityReportFilter extends DateRangeFilter {
  status?: ActivityStatus
  skip: number
  take: number
}

export interface OrderReportFilter extends DateRangeFilter {
  status?: OrderStatus
  skip: number
  take: number
}

export abstract class ReportsRepository {
  abstract getDashboardCounts(): Promise<DashboardCounts>
  abstract getOrdersAggregate(): Promise<OrdersAggregate>
  abstract getActivityStatusBreakdown(): Promise<StatusBucket[]>
  abstract getOrderStatusBreakdown(): Promise<StatusBucket[]>
  abstract findActivityRows(filter: ActivityReportFilter): Promise<PagedResult<ActivityReportRow>>
  abstract findOrderRows(filter: OrderReportFilter): Promise<PagedResult<OrderReportRow>>
}
