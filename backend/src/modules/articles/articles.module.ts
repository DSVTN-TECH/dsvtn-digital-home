import { Module } from '@nestjs/common'
import { ARTICLES_REPOSITORY } from '../../common/repository'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { PrismaArticlesRepository } from './prisma-articles.repository'

@Module({
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    { provide: ARTICLES_REPOSITORY, useClass: PrismaArticlesRepository },
  ],
  exports: [ArticlesService, ARTICLES_REPOSITORY],
})
export class ArticlesModule {}
