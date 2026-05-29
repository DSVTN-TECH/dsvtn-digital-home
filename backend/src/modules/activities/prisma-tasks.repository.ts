import { Injectable } from '@nestjs/common'
import { Task } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateTaskData, TasksRepository, UpdateTaskData } from './tasks.repository'

@Injectable()
export class PrismaTasksRepository extends TasksRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } })
  }

  async findMany(filter?: Partial<Task>): Promise<Task[]> {
    return this.prisma.task.findMany({ where: filter })
  }

  async findByActivity(activityId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { activityId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })
  }

  async create(data: CreateTaskData): Promise<Task> {
    return this.prisma.task.create({ data })
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } })
  }
}
