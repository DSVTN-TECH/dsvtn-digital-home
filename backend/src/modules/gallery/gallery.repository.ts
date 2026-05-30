import { GalleryAlbum, GalleryPhoto } from '@prisma/client'

export interface CreateAlbumData {
  title: string
  description?: string | null
  coverImageUrl?: string | null
  activityId?: string | null
  createdById: string
}

export interface UpdateAlbumData {
  title?: string
  description?: string | null
  coverImageUrl?: string | null
  activityId?: string | null
}

export interface AddPhotoData {
  albumId: string
  imageUrl: string
  caption?: string | null
  sortOrder?: number
}

export interface AlbumWithPhotos extends GalleryAlbum {
  photos: GalleryPhoto[]
}

export abstract class GalleryRepository {
  abstract listAlbums(): Promise<AlbumWithPhotos[]>
  abstract findAlbum(id: string): Promise<AlbumWithPhotos | null>
  abstract createAlbum(data: CreateAlbumData): Promise<GalleryAlbum>
  abstract updateAlbum(id: string, data: UpdateAlbumData): Promise<GalleryAlbum>
  abstract addPhoto(data: AddPhotoData): Promise<GalleryPhoto>
  abstract findPhoto(id: string): Promise<GalleryPhoto | null>
  abstract removePhoto(id: string): Promise<void>
}
