import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from './config/config.module'
import { RedisModule } from './common/redis'
import { CacheModule } from './common/cache'
import { QueueModule } from './common/queue'
import { HealthModule } from './health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { VolunteerApplicationsModule } from './modules/volunteer-applications/volunteer-applications.module'
import { ArticlesModule } from './modules/articles/articles.module'
import { ActivitiesModule } from './modules/activities/activities.module'
import { MatchingModule } from './modules/matching/matching.module'
import { ShopModule } from './modules/shop/shop.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { BadgesModule } from './modules/badges/badges.module'
import { ProfileModule } from './modules/profile/profile.module'
import { GamificationModule } from './modules/gamification/gamification.module'
import { GalleryModule } from './modules/gallery/gallery.module'
import { ReportsModule } from './modules/reports/reports.module'
import { CampaignsModule } from './modules/campaigns/campaigns.module'
import { InvitesModule } from './modules/invites/invites.module'

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    RedisModule,
    CacheModule,
    QueueModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VolunteerApplicationsModule,
    ArticlesModule,
    ActivitiesModule,
    MatchingModule,
    ShopModule,
    NotificationsModule,
    BadgesModule,
    ProfileModule,
    GamificationModule,
    GalleryModule,
    ReportsModule,
    CampaignsModule,
    InvitesModule,
  ],
})
export class AppModule {}
