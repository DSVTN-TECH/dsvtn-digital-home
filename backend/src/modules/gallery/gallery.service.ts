import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_KEY, CacheService } from '../../common/cache'
import { GALLERY_REPOSITORY } from '../../common/repository'
import { GalleryRepository } from './gallery.repository'
import { AddGalleryPhotoDto, CreateGalleryAlbumDto, UpdateGalleryAlbumDto } from './dto/gallery.dto'

const GALLERY_CACHE_TTL_SECONDS = 60

@Injectable()
export class GalleryService {
  constructor(
    @Inject(GALLERY_REPOSITORY) private readonly repo: GalleryRepository,
    private readonly cache: CacheService,
  ) {}

  async listPublic() {
    return this.cache.getOrSet(
      CACHE_KEY.galleryAlbums(),
      () => this.repo.listAlbums(),
      GALLERY_CACHE_TTL_SECONDS,
    )
  }

  async getPublic(id: string) {
    const album = await this.cache.getOrSet(
      CACHE_KEY.galleryAlbum(id),
      () => this.repo.findAlbum(id),
      GALLERY_CACHE_TTL_SECONDS,
    )
    if (!album) throw new NotFoundException('Gallery album not found')
    return album
  }

  async create(dto: CreateGalleryAlbumDto, createdById: string) {
    const album = await this.repo.createAlbum({ ...dto, createdById })
    await this.invalidateGalleryCache(album.id)
    return album
  }

  async update(id: string, dto: UpdateGalleryAlbumDto) {
    const existing = await this.repo.findAlbum(id)
    if (!existing) throw new NotFoundException('Gallery album not found')
    const album = await this.repo.updateAlbum(id, dto)
    await this.invalidateGalleryCache(id)
    return album
  }

  async addPhoto(albumId: string, dto: AddGalleryPhotoDto) {
    const album = await this.repo.findAlbum(albumId)
    if (!album) throw new NotFoundException('Gallery album not found')
    const photo = await this.repo.addPhoto({ ...dto, albumId })
    await this.invalidateGalleryCache(albumId)
    return photo
  }

  async removePhoto(id: string) {
    const photo = await this.repo.findPhoto(id)
    if (!photo) throw new NotFoundException('Gallery photo not found')
    await this.repo.removePhoto(id)
    await this.invalidateGalleryCache(photo.albumId)
    return { deleted: true }
  }

  private async invalidateGalleryCache(albumId: string) {
    await Promise.all([
      this.cache.invalidate(CACHE_KEY.galleryAlbums()),
      this.cache.invalidate(CACHE_KEY.galleryAlbum(albumId)),
    ])
  }
}
