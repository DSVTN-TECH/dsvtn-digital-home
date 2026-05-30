import { apiFetch } from '@/lib/api'
import type {
  GalleryAlbumDetail,
  GalleryAlbumSummary,
  GalleryDataSource,
} from './gallery.datasource'

export class ApiGalleryDataSource implements GalleryDataSource {
  async listAlbums(): Promise<GalleryAlbumSummary[]> {
    return apiFetch<GalleryAlbumSummary[]>('/public/gallery')
  }

  async getAlbum(id: string): Promise<GalleryAlbumDetail> {
    return apiFetch<GalleryAlbumDetail>(`/public/gallery/${id}`)
  }
}
