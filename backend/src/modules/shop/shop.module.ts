import { Module } from '@nestjs/common'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { PrismaProductsRepository } from './prisma-products.repository'
import { PrismaOrdersRepository } from './prisma-orders.repository'
import { ProductsController } from './products.controller'
import { OrdersController } from './orders.controller'
import { ProductsService } from './products.service'
import { OrdersService } from './orders.service'

@Module({
  controllers: [ProductsController, OrdersController],
  providers: [
    ProductsService,
    OrdersService,
    { provide: PRODUCTS_REPOSITORY, useClass: PrismaProductsRepository },
    { provide: ORDERS_REPOSITORY, useClass: PrismaOrdersRepository },
  ],
  exports: [ProductsService, OrdersService, PRODUCTS_REPOSITORY, ORDERS_REPOSITORY],
})
export class ShopModule {}
