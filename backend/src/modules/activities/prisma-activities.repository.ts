import { Injectable } from '@nestjs/common'
import { Activity } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  ActivitiesRepository,
  CreateActivityData,
  UpdateActivityData,
} from './activities.repository'

@Injectable()
export class PrismaActivitiesRepository extends ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<Activity | null> {
    return this.prisma.activity.findUnique({ where: { id } })
  }

  async findMany(filter?: Partial<Activity>): Promise<Activity[]> {
    return this.prisma.activity.findMany({ where: filter, orderBy: { createdAt: 'desc' } })
  }

  async findByStatus(status?: Activity['status']): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: status ? { status } : undefined,
      orderBy: { startTime: 'asc' },
    })
  }

  async create(data: CreateActivityData): Promise<Activity> {
    return this.prisma.activity.create({ data })
  }

  async update(id: string, data: UpdateActivityData): Promise<Activity> {
    return this.prisma.activity.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.activity.delete({ where: { id } })
  }
}
