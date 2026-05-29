import { Injectable } from '@nestjs/common'
import { Assignment, AssignmentStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AssignmentsRepository, CreateAssignmentData } from './assignments.repository'

@Injectable()
export class PrismaAssignmentsRepository extends AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<Assignment | null> {
    return this.prisma.assignment.findUnique({ where: { id } })
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

  async countByTask(taskId: string, excludeAssignmentId?: string): Promise<number> {
    return this.prisma.assignment.count({
      where: { taskId, id: excludeAssignmentId ? { not: excludeAssignmentId } : undefined },
    })
  }

  async findUserConflict(
    activityId: string,
    userId: string,
    excludeAssignmentId: string,
  ): Promise<Assignment | null> {
    return this.prisma.assignment.findFirst({
      where: { activityId, userId, id: { not: excludeAssignmentId } },
    })
  }

  async createMany(data: CreateAssignmentData[]): Promise<number> {
    const result = await this.prisma.assignment.createMany({ data })
    return result.count
  }

  async updateManual(
    id: string,
    data: { userId?: string; taskId?: string; status?: AssignmentStatus },
  ): Promise<Assignment> {
    return this.prisma.assignment.update({
      where: { id },
      data: { ...data, source: 'MANUAL' },
    })
  }

  async deleteByActivity(activityId: string): Promise<number> {
    const result = await this.prisma.assignment.deleteMany({
      where: { activityId, source: 'MATCHER' },
    })
    return result.count
  }
}
