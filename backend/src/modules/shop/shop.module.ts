import { Module } from '@nestjs/common'
import { PRODUCTS_REPOSITORY } from '../../common/repository'
import { PrismaProductsRepository } from './prisma-products.repository'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: PrismaProductsRepository },
  ],
  exports: [ProductsService, PRODUCTS_REPOSITORY],
})
export class ShopModule {}
