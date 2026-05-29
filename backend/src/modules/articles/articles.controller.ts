import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ArticlesService } from './articles.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'

interface AuthenticatedUser {
  id: string
}

@ApiTags('articles')
@Controller()
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Get('public/articles')
  @ApiOperation({ summary: 'List published articles (public)' })
  listPublished() {
    return this.service.listPublished()
  }

  @Get('public/articles/:identifier')
  @ApiOperation({ summary: 'Get published article detail (public)' })
  findOnePublic(@Param('identifier') identifier: string) {
    return this.service.findOnePublic(identifier)
  }

  @Get('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all articles (admin)' })
  listAll() {
    return this.service.listAll()
  }

  @Post('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create article (admin)' })
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id)
  }

  @Patch('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.service.update(id, dto)
  }

  @Delete('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive article (admin)' })
  archive(@Param('id') id: string) {
    return this.service.archive(id)
  }
}
