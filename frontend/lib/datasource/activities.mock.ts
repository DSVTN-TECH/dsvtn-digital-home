import type { Activity, Task } from '@/types/api'
import type {
  ActivitiesDataSource,
  CreateActivityInput,
  CreateTaskInput,
  UpdateActivityInput,
} from './activities.datasource'
import { mockActivities } from '@/lib/mock/activities'

const primaryActivityId = '00000000-0000-0000-0000-000000000001'

let store = [...mockActivities]
let taskStore: Task[] = [
  {
    id: 'mock-task-1',
    activityId: primaryActivityId,
    name: 'Hậu cần sân khấu',
    description: 'Chuẩn bị vật tư, bảng tên và không gian đón tiếp.',
    slotCount: 5,
    priority: 2,
  },
  {
    id: 'mock-task-2',
    activityId: primaryActivityId,
    name: 'Check-in TNV',
    description: 'Điểm danh, hướng dẫn đội hình và ghi nhận hoàn thành.',
    slotCount: 4,
    priority: 1,
  },
  {
    id: 'mock-task-3',
    activityId: primaryActivityId,
    name: 'Truyền thông hiện trường',
    description: 'Chụp ảnh, cập nhật recap và tổng hợp tư liệu sau hoạt động.',
    slotCount: 3,
    priority: 0,
  },
]

export class MockActivitiesDataSource implements ActivitiesDataSource {
  async list(): Promise<Activity[]> {
    return Promise.resolve([...store])
  }

  async getById(id: string): Promise<Activity | null> {
    return Promise.resolve(store.find((a) => a.id === id) ?? null)
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const activity: Activity = {
      id: `mock-act-${Date.now()}`,
      title: input.title,
      description: input.description ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    }
    store = [activity, ...store]
    return Promise.resolve(activity)
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity> {
    const idx = store.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Activity not found')
    store[idx] = { ...store[idx], ...input } as Activity
    return Promise.resolve(store[idx])
  }

  async listTasks(activityId: string): Promise<Task[]> {
    return Promise.resolve(taskStore.filter((t) => t.activityId === activityId))
  }

  async addTask(activityId: string, input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: `mock-task-${Date.now()}`,
      activityId,
      name: input.name,
      description: input.description ?? null,
      slotCount: input.slotCount,
      priority: input.priority ?? 0,
    }
    taskStore = [...taskStore, task]
    return Promise.resolve(task)
  }
}
