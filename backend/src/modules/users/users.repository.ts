import { User } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateUserData = {
  fullName: string
  email: string
  passwordHash: string
  mustChangePassword?: boolean
  role: 'ADMIN' | 'MEMBER' | 'LOGISTIC'
}

export type UpdateUserData = Partial<Omit<CreateUserData, 'email'>> & {
  status?: 'ACTIVE' | 'DISABLED'
  fairnessScore?: number
}

export abstract class UsersRepository extends BaseRepository<User, CreateUserData, UpdateUserData> {
  abstract findByEmail(email: string): Promise<User | null>
}
