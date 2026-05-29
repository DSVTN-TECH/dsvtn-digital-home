import { Injectable } from '@nestjs/common'
import { EmailStatus, VolunteerApplication } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateVolunteerApplicationData,
  ReviewVolunteerApplicationData,
  VolunteerApplicationsRepository,
} from './volunteer-applications.repository'

@Injectable()
export class PrismaVolunteerApplicationsRepository extends VolunteerApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<VolunteerApplication | null> {
    return this.prisma.volunteerApplication.findUnique({ where: { id } })
  }

  async findMany(filter?: Partial<VolunteerApplication>): Promise<VolunteerApplication[]> {
    return this.prisma.volunteerApplication.findMany({ where: filter })
  }

  async findByStatus(status?: string): Promise<VolunteerApplication[]> {
    const where = status ? { status: status as VolunteerApplication['status'] } : undefined
    return this.prisma.volunteerApplication.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async create(data: CreateVolunteerApplicationData): Promise<VolunteerApplication> {
    return this.prisma.volunteerApplication.create({ data })
  }

  async update(id: string, data: ReviewVolunteerApplicationData): Promise<VolunteerApplication> {
    return this.prisma.volunteerApplication.update({ where: { id }, data })
  }

  async updateEmailStatus(id: string, status: EmailStatus): Promise<VolunteerApplication> {
    return this.prisma.volunteerApplication.update({ where: { id }, data: { emailStatus: status } })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.volunteerApplication.delete({ where: { id } })
  }
}
