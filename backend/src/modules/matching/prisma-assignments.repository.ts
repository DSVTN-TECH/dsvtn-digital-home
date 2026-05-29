import { Injectable } from '@nestjs/common'
import { Assignment } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AssignmentsRepository, CreateAssignmentData } from './assignments.repository'

@Injectable()
export class PrismaAssignmentsRepository extends AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findByActivity(activityId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: { activityId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByActivityAndUser(activityId: string, userId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({ where: { activityId, userId } })
  }

  async createMany(data: CreateAssignmentData[]): Promise<number> {
    const result = await this.prisma.assignment.createMany({ data })
    return result.count
  }

  async deleteByActivity(activityId: string): Promise<number> {
    const result = await this.prisma.assignment.deleteMany({
      where: { activityId, source: 'MATCHER' },
    })
    return result.count
  }
}
