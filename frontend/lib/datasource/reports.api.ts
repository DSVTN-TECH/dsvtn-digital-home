import { apiFetch } from '@/lib/api'
import type {
  ReportsDataSource,
  ReportsOverview,
  ReportsOverviewFilters,
  ReportsDashboard,
} from './reports.datasource'

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
