import { VolunteerApplication } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateVolunteerApplicationData = {
  fullName: string
  email: string
  phone: string
  studentId: string
  note?: string
}

export type ReviewVolunteerApplicationData = {
  status: 'APPROVED' | 'REJECTED'
  reviewedById: string
  reviewedAt: Date
}

export abstract class VolunteerApplicationsRepository extends BaseRepository<
  VolunteerApplication,
  CreateVolunteerApplicationData,
  ReviewVolunteerApplicationData
> {
  abstract findByStatus(status?: string): Promise<VolunteerApplication[]>
}
