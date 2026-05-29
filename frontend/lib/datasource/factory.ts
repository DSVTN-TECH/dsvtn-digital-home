import type { ActivitiesDataSource } from './activities.datasource'
import { ApiActivitiesDataSource } from './activities.api'
import { MockActivitiesDataSource } from './activities.mock'
import type { VolunteerDataSource } from './volunteer.datasource'
import { ApiVolunteerDataSource } from './volunteer.api'
import { MockVolunteerDataSource } from './volunteer.mock'
import type { MemberActivitiesDataSource } from './registrations.datasource'
import { ApiMemberActivitiesDataSource } from './registrations.api'
import { MockMemberActivitiesDataSource } from './registrations.mock'
import type { MatchingDataSource } from './matching.datasource'
import { ApiMatchingDataSource } from './matching.api'
import { MockMatchingDataSource } from './matching.mock'
import type { MemberAssignmentsDataSource } from './assignments.datasource'
import { ApiMemberAssignmentsDataSource } from './assignments.api'
import { MockMemberAssignmentsDataSource } from './assignments.mock'

type DataSourceMode = 'mock' | 'api'

const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'

let activitiesDataSource: ActivitiesDataSource | null = null
let volunteerDataSource: VolunteerDataSource | null = null
let memberActivitiesDataSource: MemberActivitiesDataSource | null = null
let matchingDataSource: MatchingDataSource | null = null
let memberAssignmentsDataSource: MemberAssignmentsDataSource | null = null

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

export function getMemberActivitiesDataSource(): MemberActivitiesDataSource {
  if (!memberActivitiesDataSource) {
    memberActivitiesDataSource =
      mode === 'api' ? new ApiMemberActivitiesDataSource() : new MockMemberActivitiesDataSource()
  }
  return memberActivitiesDataSource
}

export function getMatchingDataSource(): MatchingDataSource {
  if (!matchingDataSource) {
    matchingDataSource = mode === 'api' ? new ApiMatchingDataSource() : new MockMatchingDataSource()
  }
  return matchingDataSource
}

export function getMemberAssignmentsDataSource(): MemberAssignmentsDataSource {
  if (!memberAssignmentsDataSource) {
    memberAssignmentsDataSource =
      mode === 'api' ? new ApiMemberAssignmentsDataSource() : new MockMemberAssignmentsDataSource()
  }
  return memberAssignmentsDataSource
}
