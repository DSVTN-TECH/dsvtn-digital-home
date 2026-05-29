import type { ActivitiesDataSource } from './activities.datasource'
import { ApiActivitiesDataSource } from './activities.api'
import { MockActivitiesDataSource } from './activities.mock'
import type { VolunteerDataSource } from './volunteer.datasource'
import { ApiVolunteerDataSource } from './volunteer.api'
import { MockVolunteerDataSource } from './volunteer.mock'

type DataSourceMode = 'mock' | 'api'

const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'

let activitiesDataSource: ActivitiesDataSource | null = null
let volunteerDataSource: VolunteerDataSource | null = null

export function getActivitiesDataSource(): ActivitiesDataSource {
  if (!activitiesDataSource) {
    activitiesDataSource =
      mode === 'api' ? new ApiActivitiesDataSource() : new MockActivitiesDataSource()
  }
  return activitiesDataSource
}

export function getVolunteerDataSource(): VolunteerDataSource {
  if (!volunteerDataSource) {
    volunteerDataSource =
      mode === 'api' ? new ApiVolunteerDataSource() : new MockVolunteerDataSource()
  }
  return volunteerDataSource
}
