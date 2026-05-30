import { Injectable } from '@nestjs/common'
import { Invite, InviteStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateInviteData,
  InviteListFilter,
  InvitesRepository,
  PagedResult,
} from './invites.repository'

@Injectable()
export class PrismaInvitesRepository extends InvitesRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async list(filter: InviteListFilter): Promise<PagedResult<Invite>> {
    const where: Prisma.InviteWhereInput = {}
    if (filter.status) where.status = filter.status

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter.skip,
        take: filter.take,
      }),
      this.prisma.invite.count({ where }),
    ])
    return { items, total }
  }

  async findById(id: string): Promise<Invite | null> {
    return this.prisma.invite.findUnique({ where: { id } })
  }

  async findByTokenHash(tokenHash: string): Promise<Invite | null> {
    return this.prisma.invite.findFirst({ where: { tokenHash } })
  }

  async create(data: CreateInviteData): Promise<Invite> {
    return this.prisma.invite.create({
      data: {
        email: data.email,
        role: data.role,
        tokenHash: data.tokenHash,
        invitedById: data.invitedById,
        expiresAt: data.expiresAt,
      },
    })
  }

  async updateStatus(id: string, status: InviteStatus, acceptedAt?: Date): Promise<Invite> {
    return this.prisma.invite.update({
      where: { id },
      data: { status, acceptedAt: acceptedAt ?? undefined },
    })
  }
}
