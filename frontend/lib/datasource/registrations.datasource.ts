import type { Activity, Task } from '@/types/api'

export interface PreferenceInput {
  taskId: string
  score: number
}

export interface RegistrationResult {
  id: string
  activityId: string
  userId: string
  status: string
  preferences: { taskId: string; score: number }[]
}

export interface MemberActivitiesDataSource {
  listOpen(): Promise<Activity[]>
  getDetail(id: string): Promise<{ activity: Activity; tasks: Task[] } | null>
  submitRegistration(
    activityId: string,
    preferences: PreferenceInput[],
  ): Promise<RegistrationResult>
}
