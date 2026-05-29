import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { USERS_REPOSITORY } from '../../common/repository'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

const baseUser = {
  id: 'u-1',
  fullName: 'Test User',
  email: 'test@dsvtn.vn',
  passwordHash: '$2b$12$hash',
  role: 'MEMBER' as const,
  status: 'ACTIVE' as const,
  fairnessScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('UsersService', () => {
  let service: UsersService
  let repo: jest.Mocked<
    Pick<UsersRepository, 'findMany' | 'findById' | 'findByEmail' | 'create' | 'update' | 'delete'>
  >

  beforeEach(async () => {
    repo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: USERS_REPOSITORY, useValue: repo }],
    }).compile()

    service = module.get(UsersService)
  })

  it('create: returns user with temporaryPassword (no passwordHash)', async () => {
    repo.findByEmail.mockResolvedValue(null)
    repo.create.mockResolvedValue(baseUser)

    const result = await service.create({
      fullName: baseUser.fullName,
      email: baseUser.email,
      role: baseUser.role,
    })

    expect(result.temporaryPassword).toBeDefined()
    expect(result).not.toHaveProperty('passwordHash')
    expect(result.email).toBe(baseUser.email)
  })

  it('create: throws ConflictException when email already exists', async () => {
    repo.findByEmail.mockResolvedValue(baseUser)

    await expect(
      service.create({ fullName: 'X', email: baseUser.email, role: 'MEMBER' }),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('findAll: returns users without passwordHash', async () => {
    repo.findMany.mockResolvedValue([baseUser])

    const result = await service.findAll()

    expect(result).toHaveLength(1)
    expect(result[0]).not.toHaveProperty('passwordHash')
    expect(result[0].email).toBe(baseUser.email)
  })

  it('update: throws NotFoundException when user does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(service.update('nonexistent-id', { status: 'DISABLED' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
