import { Module } from '@nestjs/common'
import { GALLERY_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { GalleryController } from './gallery.controller'
import { GalleryService } from './gallery.service'
import { PrismaGalleryRepository } from './prisma-gallery.repository'

@Module({
  imports: [AuthModule],
  controllers: [GalleryController],
  providers: [GalleryService, { provide: GALLERY_REPOSITORY, useClass: PrismaGalleryRepository }],
  exports: [GalleryService],
})
export class GalleryModule {}
