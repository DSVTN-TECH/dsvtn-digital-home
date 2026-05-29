import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { VOLUNTEER_APPLICATIONS_REPOSITORY } from '../../common/repository'
import { VolunteerApplicationsRepository } from './volunteer-applications.repository'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ReviewApplicationDto } from './dto/review-application.dto'

@Injectable()
export class VolunteerApplicationsService {
  constructor(
    @Inject(VOLUNTEER_APPLICATIONS_REPOSITORY)
    private readonly repo: VolunteerApplicationsRepository,
  ) {}

  async submit(dto: CreateApplicationDto) {
    const app = await this.repo.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      studentId: dto.studentId,
      note: dto.note,
    })
    return { id: app.id, status: app.status, createdAt: app.createdAt }
  }

  async findAll(status?: string) {
    return this.repo.findByStatus(status)
  }

  async review(id: string, dto: ReviewApplicationDto, reviewerId: string) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundException('Application not found')
    }
    return this.repo.update(id, {
      status: dto.status,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    })
  }
}
