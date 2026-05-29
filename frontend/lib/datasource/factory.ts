import type { ActivitiesDataSource } from './activities.datasource'
import { ApiActivitiesDataSource } from './activities.api'
import { MockActivitiesDataSource } from './activities.mock'

type DataSourceMode = 'mock' | 'api'

const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'

let activitiesDataSource: ActivitiesDataSource | null = null

export function getActivitiesDataSource(): ActivitiesDataSource {
  if (!activitiesDataSource) {
    activitiesDataSource =
      mode === 'api' ? new ApiActivitiesDataSource() : new MockActivitiesDataSource()
  }
  return activitiesDataSource
}
