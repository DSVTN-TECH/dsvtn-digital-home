import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserData, UpdateUserData, UsersRepository } from './users.repository'

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findMany(filter?: Partial<User>): Promise<User[]> {
    return this.prisma.user.findMany({ where: filter })
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }
}
