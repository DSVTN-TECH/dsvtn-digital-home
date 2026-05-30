export interface GalleryPhoto {
  id: string
  albumId: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export interface GalleryAlbumSummary {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  activityId: string | null
  createdAt: string
}

export interface GalleryAlbumDetail extends GalleryAlbumSummary {
  photos: GalleryPhoto[]
}

export interface GalleryDataSource {
  listAlbums(): Promise<GalleryAlbumSummary[]>
  getAlbum(id: string): Promise<GalleryAlbumDetail>
}
