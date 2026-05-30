import { Module } from '@nestjs/common'
import { USERS_REPOSITORY } from '../../common/repository'
import { EmailModule } from '../../common/email'
import { AuthModule } from '../auth/auth.module'
import { PrismaUsersRepository } from '../users/prisma-users.repository'
import { InvitesController } from './invites.controller'
import { InvitesEmailListener } from './invites-email.listener'
import { INVITES_REPOSITORY } from './invites.repository'
import { InvitesService } from './invites.service'
import { PrismaInvitesRepository } from './prisma-invites.repository'

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [InvitesController],
  providers: [
    InvitesService,
    InvitesEmailListener,
    { provide: INVITES_REPOSITORY, useClass: PrismaInvitesRepository },
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [InvitesService],
})
export class InvitesModule {}
