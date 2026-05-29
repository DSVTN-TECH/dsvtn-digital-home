import { apiFetch } from '@/lib/api'
import type { MemberAssignment, MemberAssignmentsDataSource } from './assignments.datasource'

export class ApiMemberAssignmentsDataSource implements MemberAssignmentsDataSource {
  async listMyAssignments(activityId: string): Promise<MemberAssignment[]> {
    return apiFetch<MemberAssignment[]>(`/member/activities/${activityId}/assignments`)
  }
}
