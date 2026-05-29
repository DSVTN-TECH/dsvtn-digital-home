import { apiFetch } from '@/lib/api'
import type { Activity, Task } from '@/types/api'
import type {
  ActivitiesDataSource,
  CreateActivityInput,
  CreateTaskInput,
  UpdateActivityInput,
} from './activities.datasource'

export class ApiActivitiesDataSource implements ActivitiesDataSource {
  async list(): Promise<Activity[]> {
    return apiFetch<Activity[]>('/admin/activities')
  }

  async getById(id: string): Promise<Activity | null> {
    return apiFetch<Activity>(`/admin/activities/${id}`).catch(() => null)
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    return apiFetch<Activity>('/admin/activities', { method: 'POST', body: JSON.stringify(input) })
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity> {
    return apiFetch<Activity>(`/admin/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  async listTasks(activityId: string): Promise<Task[]> {
    return apiFetch<Task[]>(`/admin/activities/${activityId}/tasks`)
  }

  async addTask(activityId: string, input: CreateTaskInput): Promise<Task> {
    return apiFetch<Task>(`/admin/activities/${activityId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }
}
