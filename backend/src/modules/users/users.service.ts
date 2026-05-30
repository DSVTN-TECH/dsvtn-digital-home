import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { USERS_REPOSITORY } from '../../common/repository'
import { UsersRepository } from './users.repository'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(@Inject(USERS_REPOSITORY) private readonly users: UsersRepository) {}

  async findAll(filters?: { role?: string; status?: string }) {
    const where: Record<string, unknown> = {}
    if (filters?.role) where.role = filters.role
    if (filters?.status) where.status = filters.status

    const users = await this.users.findMany(where as never)
    return users.map((user) => this.stripPassword(user))
  }

  private stripPassword<T extends { passwordHash: string }>(user: T) {
    const safe = { ...user }
    delete (safe as Partial<T>).passwordHash
    return safe
  }

  async create(dto: CreateUserDto) {
    const existing = await this.users.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('Email already exists')
    }

    const temporaryPassword = randomBytes(8).toString('base64url').slice(0, 10)
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)

    const user = await this.users.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      mustChangePassword: true,
      role: dto.role,
    })

    return { ...this.stripPassword(user), temporaryPassword }
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.users.findById(id)
    if (!existing) {
      throw new NotFoundException('User not found')
    }

    const updated = await this.users.update(id, dto)
    return this.stripPassword(updated)
  }
}
