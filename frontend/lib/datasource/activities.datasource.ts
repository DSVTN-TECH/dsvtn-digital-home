import type { Activity } from '@/types/api'

export interface ActivitiesDataSource {
  list(): Promise<Activity[]>
  getById(id: string): Promise<Activity | null>
}
