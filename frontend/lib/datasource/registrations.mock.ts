import type { Activity, Task } from '@/types/api'
import { mockActivities } from '@/lib/mock/activities'
import type {
  MemberActivitiesDataSource,
  PreferenceInput,
  RegistrationResult,
} from './registrations.datasource'

const mockTasks: Task[] = [
  {
    id: 'mock-task-1',
    activityId: mockActivities[0].id,
    name: 'Hậu cần',
    description: null,
    slotCount: 3,
    priority: 1,
  },
  {
    id: 'mock-task-2',
    activityId: mockActivities[0].id,
    name: 'Tiếp đón',
    description: null,
    slotCount: 2,
    priority: 0,
  },
]

const registeredSet = new Set<string>()

export class MockMemberActivitiesDataSource implements MemberActivitiesDataSource {
  async listOpen(): Promise<Activity[]> {
    return Promise.resolve(mockActivities.filter((a) => a.status === 'OPEN'))
  }

  async getDetail(id: string): Promise<{ activity: Activity; tasks: Task[] } | null> {
    const activity = mockActivities.find((a) => a.id === id)
    if (!activity) return null
    const tasks = mockTasks.filter((t) => t.activityId === id)
    return Promise.resolve({ activity, tasks })
  }

  async submitRegistration(
    activityId: string,
    preferences: PreferenceInput[],
  ): Promise<RegistrationResult> {
    if (registeredSet.has(activityId)) throw new Error('Bạn đã đăng ký hoạt động này')
    registeredSet.add(activityId)
    return Promise.resolve({
      id: `mock-reg-${Date.now()}`,
      activityId,
      userId: 'mock-user',
      status: 'SUBMITTED',
      preferences,
    })
  }
}
