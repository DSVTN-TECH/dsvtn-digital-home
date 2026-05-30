import { Injectable } from '@nestjs/common'
import { GalleryAlbum, GalleryPhoto } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  AddPhotoData,
  AlbumWithPhotos,
  CreateAlbumData,
  GalleryRepository,
  UpdateAlbumData,
} from './gallery.repository'

@Injectable()
export class PrismaGalleryRepository extends GalleryRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async listAlbums(): Promise<AlbumWithPhotos[]> {
    return this.prisma.galleryAlbum.findMany({
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAlbum(id: string): Promise<AlbumWithPhotos | null> {
    return this.prisma.galleryAlbum.findUnique({
      where: { id },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    })
  }

  async createAlbum(data: CreateAlbumData): Promise<GalleryAlbum> {
    return this.prisma.galleryAlbum.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        activityId: data.activityId ?? null,
        createdById: data.createdById,
      },
    })
  }

  async updateAlbum(id: string, data: UpdateAlbumData): Promise<GalleryAlbum> {
    return this.prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        activityId: data.activityId,
      },
    })
  }

  async addPhoto(data: AddPhotoData): Promise<GalleryPhoto> {
    return this.prisma.galleryPhoto.create({
      data: {
        albumId: data.albumId,
        imageUrl: data.imageUrl,
        caption: data.caption ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    })
  }

  async findPhoto(id: string): Promise<GalleryPhoto | null> {
    return this.prisma.galleryPhoto.findUnique({ where: { id } })
  }

  async removePhoto(id: string): Promise<void> {
    await this.prisma.galleryPhoto.delete({ where: { id } })
  }
}
