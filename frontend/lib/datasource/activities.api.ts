import { apiFetch } from '@/lib/api'
import type { Activity } from '@/types/api'
import type { ActivitiesDataSource } from './activities.datasource'

export class ApiActivitiesDataSource implements ActivitiesDataSource {
  async list(): Promise<Activity[]> {
    return apiFetch<Activity[]>('/activities')
  }

  async getById(id: string): Promise<Activity | null> {
    return apiFetch<Activity>(`/activities/${id}`).catch(() => null)
  }
}
