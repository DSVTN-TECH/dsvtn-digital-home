import { mockActivities } from '@/lib/mock/activities'
import type { Activity } from '@/types/api'
import type { ActivitiesDataSource } from './activities.datasource'

export class MockActivitiesDataSource implements ActivitiesDataSource {
  async list(): Promise<Activity[]> {
    return Promise.resolve([...mockActivities])
  }

  async getById(id: string): Promise<Activity | null> {
    return Promise.resolve(mockActivities.find((a) => a.id === id) ?? null)
  }
}
