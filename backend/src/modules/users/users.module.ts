import { Module } from '@nestjs/common'
import { USERS_REPOSITORY } from '../../common/repository'
import { PrismaUsersRepository } from './prisma-users.repository'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
