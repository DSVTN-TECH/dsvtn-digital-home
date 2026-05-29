import type { Activity, Task } from '@/types/api'

export interface CreateActivityInput {
  title: string
  description?: string
  startTime: string
  endTime: string
}

export interface UpdateActivityInput {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  status?: Activity['status']
}

export interface CreateTaskInput {
  name: string
  description?: string
  slotCount: number
  priority?: number
}

export interface ActivitiesDataSource {
  list(): Promise<Activity[]>
  getById(id: string): Promise<Activity | null>
  create(input: CreateActivityInput): Promise<Activity>
  update(id: string, input: UpdateActivityInput): Promise<Activity>
  listTasks(activityId: string): Promise<Task[]>
  addTask(activityId: string, input: CreateTaskInput): Promise<Task>
}
