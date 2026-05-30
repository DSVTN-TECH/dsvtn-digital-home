import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { Invite } from '@prisma/client'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { QUEUE_NAME, QueueService } from '../../common/queue'
import { USERS_REPOSITORY } from '../../common/repository'
import { UsersRepository } from '../users/users.repository'
import { AcceptInviteDto, CreateInviteDto, ListInvitesQueryDto } from './dto/invites.dto'
import { INVITES_REPOSITORY, InvitesRepository } from './invites.repository'

const DEFAULT_EXPIRES_DAYS = 7

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name)

  constructor(
    @Inject(INVITES_REPOSITORY) private readonly invites: InvitesRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly queue: QueueService,
  ) {}

  async create(dto: CreateInviteDto, invitedById: string) {
    const existingUser = await this.users.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException('A user with this email already exists')
    }

    const token = randomBytes(32).toString('base64url')
    const tokenHash = hashInviteToken(token)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays ?? DEFAULT_EXPIRES_DAYS))

    const invite = await this.invites.create({
      email: dto.email,
      role: dto.role,
      tokenHash,
      invitedById,
      expiresAt,
    })

    await this.enqueueInviteEmail(invite, token)

    return { ...this.toSafe(invite), token }
  }

  async list(query: ListInvitesQueryDto) {
    const skip = (query.page - 1) * query.pageSize
    const result = await this.invites.list({ status: query.status, skip, take: query.pageSize })
    return {
      items: result.items.map((invite) => this.toSafe(invite)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    }
  }

  async revoke(id: string) {
    const invite = await this.invites.findById(id)
    if (!invite) throw new NotFoundException('Invite not found')
    if (invite.status !== 'PENDING') {
      throw new UnprocessableEntityException('Only pending invites can be revoked')
    }
    const updated = await this.invites.updateStatus(id, 'REVOKED')
    return this.toSafe(updated)
  }

  async accept(token: string, dto: AcceptInviteDto) {
    const tokenHash = hashInviteToken(token)
    const invite = await this.invites.findByTokenHash(tokenHash)
    if (!invite) throw new NotFoundException('Invite not found')

    if (invite.status === 'ACCEPTED') {
      throw new ConflictException('Invite has already been accepted')
    }
    if (invite.status === 'REVOKED') {
      throw new UnprocessableEntityException('Invite has been revoked')
    }
    if (invite.status === 'EXPIRED' || invite.expiresAt.getTime() < Date.now()) {
      if (invite.status !== 'EXPIRED') {
        await this.invites.updateStatus(invite.id, 'EXPIRED')
      }
      throw new UnprocessableEntityException('Invite has expired')
    }

    const existingUser = await this.users.findByEmail(invite.email)
    if (existingUser) {
      await this.invites.updateStatus(invite.id, 'ACCEPTED', new Date())
      throw new ConflictException('A user with this email already exists')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await this.users.create({
      fullName: dto.fullName,
      email: invite.email,
      passwordHash,
      mustChangePassword: false,
      role: invite.role,
    })

    await this.invites.updateStatus(invite.id, 'ACCEPTED', new Date())

    const safe = { ...user } as Partial<typeof user>
    delete safe.passwordHash
    return { user: safe, accepted: true }
  }

  private async enqueueInviteEmail(invite: Invite, token: string): Promise<void> {
    try {
      await this.queue.enqueue(
        QUEUE_NAME.email,
        {
          to: invite.email,
          subject: 'ĐSVTN: Lời mời tham gia hệ thống',
          body: `Bạn được mời tham gia ĐSVTN với vai trò ${invite.role}. Token mời: ${token}`,
        },
        { jobId: `invite:${invite.id}` },
      )
    } catch (error) {
      this.logger.warn(
        `Invite email enqueue failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      )
    }
  }

  private toSafe(invite: Invite) {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      invitedById: invite.invitedById,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
    }
  }
}
