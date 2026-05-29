import { apiFetch } from '@/lib/api'
import type { MatchingDataSource, MatcherRunResult, SavedAssignment } from './matching.datasource'

export class ApiMatchingDataSource implements MatchingDataSource {
  async run(activityId: string): Promise<MatcherRunResult> {
    return apiFetch<MatcherRunResult>(`/admin/activities/${activityId}/matcher/run`, {
      method: 'POST',
    })
  }

  async listAssignments(activityId: string): Promise<SavedAssignment[]> {
    return apiFetch<SavedAssignment[]>(`/admin/activities/${activityId}/assignments`)
  }
}
