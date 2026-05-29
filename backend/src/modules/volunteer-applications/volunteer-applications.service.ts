import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EmailStatus } from '@prisma/client'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { VOLUNTEER_APPLICATIONS_REPOSITORY } from '../../common/repository'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ReviewApplicationDto } from './dto/review-application.dto'
import { VolunteerApplicationsRepository } from './volunteer-applications.repository'

@Injectable()
export class VolunteerApplicationsService {
  private readonly logger = new Logger(VolunteerApplicationsService.name)

  constructor(
    @Inject(VOLUNTEER_APPLICATIONS_REPOSITORY)
    private readonly repo: VolunteerApplicationsRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
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

    const reviewed = await this.repo.update(id, {
      status: dto.status,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    })

    if (dto.status !== 'APPROVED') {
      return reviewed
    }

    const emailStatus = await this.sendVolunteerApprovalEmail(existing.email, existing.fullName)
    return this.repo.updateEmailStatus(id, emailStatus)
  }

  private async sendVolunteerApprovalEmail(to: string, fullName: string): Promise<EmailStatus> {
    try {
      return await this.emailProvider.sendConfirmation(
        to,
        'ĐSVTN: Đơn đăng ký tình nguyện viên đã được duyệt',
        `Chào ${fullName}, đơn đăng ký của bạn đã được duyệt. Vui lòng đăng nhập khi nhận được tài khoản nội bộ.`,
      )
    } catch (error) {
      this.logger.warn(
        `Volunteer approval email failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      )
      return 'FAILED'
    }
  }
}
