import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { USERS_REPOSITORY } from '../../common/repository'
import { UsersRepository } from '../users/users.repository'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService
  let usersRepo: jest.Mocked<Pick<UsersRepository, 'findByEmail' | 'findById' | 'update'>>
  let jwt: jest.Mocked<Pick<JwtService, 'signAsync'>>

  const baseUser = {
    id: 'u-1',
    fullName: 'Admin',
    email: 'admin@dsvtn.vn',
    passwordHash: '',
    role: 'ADMIN' as const,
    mustChangePassword: false,
    status: 'ACTIVE' as const,
    fairnessScore: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('changeme', 4)
    baseUser.passwordHash = passwordHash

    usersRepo = { findByEmail: jest.fn(), findById: jest.fn(), update: jest.fn() }
    jwt = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('signed.access.token')
        .mockResolvedValueOnce('signed.refresh.token'),
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USERS_REPOSITORY, useValue: usersRepo },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it('returns token pair + user on valid credentials', async () => {
    usersRepo.findByEmail.mockResolvedValue(baseUser as never)

    const result = await service.login({ email: baseUser.email, password: 'changeme' })

    expect(result.accessToken).toBe('signed.access.token')
    expect(result.refreshToken).toBe('signed.refresh.token')
    expect(result.user).toEqual({
      id: baseUser.id,
      fullName: baseUser.fullName,
      email: baseUser.email,
      role: baseUser.role,
      mustChangePassword: false,
    })
    expect(jwt.signAsync).toHaveBeenCalledTimes(2)
  })

  it('throws Unauthorized when email not found', async () => {
    usersRepo.findByEmail.mockResolvedValue(null)

    await expect(
      service.login({ email: 'nope@dsvtn.vn', password: 'changeme' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('throws Unauthorized when password is wrong', async () => {
    usersRepo.findByEmail.mockResolvedValue(baseUser as never)

    await expect(
      service.login({ email: baseUser.email, password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('throws Unauthorized when user is DISABLED', async () => {
    usersRepo.findByEmail.mockResolvedValue({ ...baseUser, status: 'DISABLED' } as never)

    await expect(
      service.login({ email: baseUser.email, password: 'changeme' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('changes password and clears must-change flag', async () => {
    usersRepo.findById
      .mockResolvedValueOnce({ ...baseUser, mustChangePassword: true } as never)
      .mockResolvedValueOnce({ ...baseUser, mustChangePassword: false } as never)
    usersRepo.update.mockResolvedValue({ ...baseUser, mustChangePassword: false } as never)

    const result = await service.changePassword(baseUser.id, {
      currentPassword: 'changeme',
      newPassword: 'new-password-123',
    })

    expect(usersRepo.update).toHaveBeenCalledWith(
      baseUser.id,
      expect.objectContaining({ mustChangePassword: false }),
    )
    expect(result.user.mustChangePassword).toBe(false)
    expect(jwt.signAsync).toHaveBeenCalledTimes(2)
  })
})
