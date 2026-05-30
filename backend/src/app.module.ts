import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from './config/config.module'
import { RedisModule } from './common/redis'
import { HealthModule } from './health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { VolunteerApplicationsModule } from './modules/volunteer-applications/volunteer-applications.module'
import { ArticlesModule } from './modules/articles/articles.module'
import { ActivitiesModule } from './modules/activities/activities.module'
import { MatchingModule } from './modules/matching/matching.module'
import { ShopModule } from './modules/shop/shop.module'

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VolunteerApplicationsModule,
    ArticlesModule,
    ActivitiesModule,
    MatchingModule,
    ShopModule,
  ],
})
export class AppModule {}
