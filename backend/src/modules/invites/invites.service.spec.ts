import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { QueueService } from '../../common/queue'
import { USERS_REPOSITORY } from '../../common/repository'
import { INVITES_REPOSITORY, InvitesRepository } from './invites.repository'
import { hashInviteToken, InvitesService } from './invites.service'

const invite = {
  id: 'i-1',
  email: 'new@example.com',
  role: 'MEMBER' as const,
  tokenHash: hashInviteToken('token-1'),
  status: 'PENDING' as const,
  invitedById: 'admin-1',
  expiresAt: new Date(Date.now() + 86400000),
  acceptedAt: null,
  createdAt: new Date('2026-05-30T00:00:00Z'),
}

describe('InvitesService', () => {
  let service: InvitesService
  let invites: jest.Mocked<InvitesRepository>
  let users: { findByEmail: jest.Mock; create: jest.Mock }
  let queue: { enqueue: jest.Mock }
  let emailProvider: jest.Mocked<EmailProvider>

  beforeEach(async () => {
    invites = {
      list: jest.fn().mockResolvedValue({ total: 1, items: [invite] }),
      findById: jest.fn().mockResolvedValue(invite),
      findByTokenHash: jest.fn().mockResolvedValue(invite),
      create: jest.fn().mockResolvedValue(invite),
      updateStatus: jest
        .fn()
        .mockResolvedValue({ ...invite, status: 'ACCEPTED', acceptedAt: new Date() }),
    } as unknown as jest.Mocked<InvitesRepository>
    users = { findByEmail: jest.fn().mockResolvedValue(null), create: jest.fn() }
    users.create.mockResolvedValue({
      id: 'u-1',
      fullName: 'New Member',
      email: invite.email,
      passwordHash: 'hash',
      role: invite.role,
      mustChangePassword: false,
      fairnessScore: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    queue = { enqueue: jest.fn().mockResolvedValue({ id: 'job-1' }) }
    emailProvider = { sendConfirmation: jest.fn() }

    const moduleRef = await Test.createTestingModule({
      providers: [
        InvitesService,
        { provide: INVITES_REPOSITORY, useValue: invites },
        { provide: USERS_REPOSITORY, useValue: users },
        { provide: EMAIL_PROVIDER, useValue: emailProvider },
        { provide: QueueService, useValue: queue },
      ],
    }).compile()
    service = moduleRef.get(InvitesService)
  })

  it('hashes invite tokens deterministically without exposing plaintext', () => {
    expect(hashInviteToken('abc')).toBe(hashInviteToken('abc'))
    expect(hashInviteToken('abc')).not.toContain('abc')
  })

  it('creates invite with plaintext token only in response and queues email', async () => {
    const result = await service.create({ email: invite.email, role: invite.role }, 'admin-1')

    expect(result.token).toEqual(expect.any(String))
    expect(result).not.toHaveProperty('tokenHash')
    expect(invites.create).toHaveBeenCalledWith(
      expect.objectContaining({ tokenHash: expect.any(String) }),
    )
    expect(queue.enqueue).toHaveBeenCalled()
  })

  it('rejects create when user already exists', async () => {
    users.findByEmail.mockResolvedValue({ id: 'u-existing' })
    await expect(
      service.create({ email: invite.email, role: invite.role }, 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('revokes only pending invites', async () => {
    const revoked = await service.revoke('i-1')
    expect(revoked.status).toBe('ACCEPTED')
    invites.findById.mockResolvedValue({ ...invite, status: 'ACCEPTED' })
    await expect(service.revoke('i-1')).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('accepts pending invite and creates safe user', async () => {
    const result = await service.accept('token-1', {
      fullName: 'New Member',
      password: 'password-123',
    })

    expect(users.create).toHaveBeenCalledWith(expect.objectContaining({ email: invite.email }))
    expect(invites.updateStatus).toHaveBeenCalledWith('i-1', 'ACCEPTED', expect.any(Date))
    expect(result.user).not.toHaveProperty('passwordHash')
  })

  it('rejects missing, expired, revoked, and reused invites', async () => {
    invites.findByTokenHash.mockResolvedValueOnce(null)
    await expect(
      service.accept('bad', { fullName: 'A B', password: 'password-123' }),
    ).rejects.toBeInstanceOf(NotFoundException)

    invites.findByTokenHash.mockResolvedValueOnce({ ...invite, status: 'REVOKED' })
    await expect(
      service.accept('token-1', { fullName: 'A B', password: 'password-123' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)

    invites.findByTokenHash.mockResolvedValueOnce({ ...invite, status: 'ACCEPTED' })
    await expect(
      service.accept('token-1', { fullName: 'A B', password: 'password-123' }),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
