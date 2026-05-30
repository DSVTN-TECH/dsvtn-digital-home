import { Module } from '@nestjs/common'
import { EmailModule } from '../../common/email'
import { LockModule } from '../../common/lock'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { PrismaOrdersRepository } from './prisma-orders.repository'
import { PrismaProductsRepository } from './prisma-products.repository'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [EmailModule, LockModule],
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
