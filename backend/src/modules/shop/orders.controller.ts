import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('public/orders')
  @ApiOperation({ summary: 'Create order (public)' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto)
  }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LOGISTIC')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (admin/logistic)' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status)
  }

  @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LOGISTIC')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail (admin/logistic)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }
}
