import { Injectable } from '@nestjs/common'
import { ActivityRegistration } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateRegistrationData,
  RegistrationsRepository,
  RegistrationWithPreferences,
} from './registrations.repository'

@Injectable()
export class PrismaRegistrationsRepository extends RegistrationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findByActivityAndUser(
    activityId: string,
    userId: string,
  ): Promise<ActivityRegistration | null> {
    return this.prisma.activityRegistration.findUnique({
      where: { activityId_userId: { activityId, userId } },
    })
  }

  async findByActivity(activityId: string): Promise<RegistrationWithPreferences[]> {
    return this.prisma.activityRegistration.findMany({
      where: { activityId },
      include: { preferences: true },
      orderBy: { submittedAt: 'asc' },
    })
  }

  async create(data: CreateRegistrationData): Promise<RegistrationWithPreferences> {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.activityRegistration.create({
        data: {
          activityId: data.activityId,
          userId: data.userId,
        },
      })

      if (data.preferences.length > 0) {
        await tx.taskPreference.createMany({
          data: data.preferences.map((p) => ({
            registrationId: registration.id,
            taskId: p.taskId,
            score: p.score,
          })),
        })
      }

      const preferences = await tx.taskPreference.findMany({
        where: { registrationId: registration.id },
      })

      return { ...registration, preferences }
    })
  }
}
