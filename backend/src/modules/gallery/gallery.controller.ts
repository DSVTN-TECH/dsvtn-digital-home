import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { GalleryService } from './gallery.service'
import { AddGalleryPhotoDto, CreateGalleryAlbumDto, UpdateGalleryAlbumDto } from './dto/gallery.dto'

@ApiTags('gallery')
@Controller()
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get('public/gallery')
  @ApiOperation({ summary: 'List public recap albums' })
  listPublic() {
    return this.gallery.listPublic()
  }

  @Get('public/gallery/:id')
  @ApiOperation({ summary: 'Get public recap album with photos' })
  getPublic(@Param('id') id: string) {
    return this.gallery.getPublic(id)
  }

  @Post('admin/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create recap album (admin)' })
  create(@Body() dto: CreateGalleryAlbumDto, @CurrentUser() user: { id: string }) {
    return this.gallery.create(dto, user.id)
  }

  @Patch('admin/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update recap album (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateGalleryAlbumDto) {
    return this.gallery.update(id, dto)
  }

  @Post('admin/gallery/:id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photo URL to album (admin)' })
  addPhoto(@Param('id') id: string, @Body() dto: AddGalleryPhotoDto) {
    return this.gallery.addPhoto(id, dto)
  }

  @Delete('admin/gallery/photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove photo from album (admin)' })
  removePhoto(@Param('photoId') photoId: string) {
    return this.gallery.removePhoto(photoId)
  }
}
