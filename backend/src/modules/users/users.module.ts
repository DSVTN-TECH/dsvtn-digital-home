import { Module } from '@nestjs/common'
import { USERS_REPOSITORY } from '../../common/repository'
import { PrismaUsersRepository } from './prisma-users.repository'

@Module({
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
