import type { ActivityReportRow, OrderReportRow } from '@/lib/datasource/reports.datasource'

export const mockReportActivities: ActivityReportRow[] = [
  {
    id: 'mock-report-activity-1',
    title: 'Mùa Hè Xanh 2026',
    status: 'OPEN',
    startTime: '2026-06-01T08:00:00.000Z',
    endTime: '2026-06-30T17:00:00.000Z',
    taskCount: 5,
    registrationCount: 48,
    assignmentCount: 35,
  },
  {
    id: 'mock-report-activity-2',
    title: 'Trung thu cho em',
    status: 'COMPLETED',
    startTime: '2026-09-20T08:00:00.000Z',
    endTime: '2026-09-20T20:00:00.000Z',
    taskCount: 4,
    registrationCount: 32,
    assignmentCount: 30,
  },
]

export const mockReportOrders: OrderReportRow[] = [
  {
    id: 'mock-report-order-1',
    customerName: 'Nguyễn An',
    status: 'CONFIRMED',
    itemCount: 2,
    totalCents: 240000,
    createdAt: '2026-05-20T08:00:00.000Z',
  },
  {
    id: 'mock-report-order-2',
    customerName: 'Trần Bình',
    status: 'DELIVERED',
    itemCount: 1,
    totalCents: 120000,
    createdAt: '2026-05-21T09:30:00.000Z',
  },
]
