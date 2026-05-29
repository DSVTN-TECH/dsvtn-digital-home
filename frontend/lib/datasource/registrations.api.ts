import { apiFetch } from '@/lib/api'
import type { Activity, Task } from '@/types/api'
import type {
  MemberActivitiesDataSource,
  PreferenceInput,
  RegistrationResult,
} from './registrations.datasource'

export class ApiMemberActivitiesDataSource implements MemberActivitiesDataSource {
  async listOpen(): Promise<Activity[]> {
    return apiFetch<Activity[]>('/member/activities')
  }

  async getDetail(id: string): Promise<{ activity: Activity; tasks: Task[] } | null> {
    try {
      const activity = await apiFetch<Activity>(`/member/activities/${id}`)
      const tasks = await apiFetch<Task[]>(`/admin/activities/${id}/tasks`)
      return { activity, tasks }
    } catch {
      return null
    }
  }

  async submitRegistration(
    activityId: string,
    preferences: PreferenceInput[],
  ): Promise<RegistrationResult> {
    return apiFetch<RegistrationResult>(`/member/activities/${activityId}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    })
  }
}
