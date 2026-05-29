import { ActivityRegistration, TaskPreference } from '@prisma/client'

export type CreatePreferenceData = { taskId: string; score: number }

export type CreateRegistrationData = {
  activityId: string
  userId: string
  preferences: CreatePreferenceData[]
}

export type RegistrationWithPreferences = ActivityRegistration & {
  preferences: TaskPreference[]
}

export abstract class RegistrationsRepository {
  abstract findByActivityAndUser(
    activityId: string,
    userId: string,
  ): Promise<ActivityRegistration | null>

  abstract findByActivity(activityId: string): Promise<RegistrationWithPreferences[]>

  abstract create(data: CreateRegistrationData): Promise<RegistrationWithPreferences>
}
