import type {
  GalleryAlbumDetail,
  GalleryAlbumSummary,
  GalleryDataSource,
} from './gallery.datasource'

const mockAlbums: GalleryAlbumDetail[] = [
  {
    id: 'album-1',
    title: 'Mùa hè xanh 2026',
    description: 'Những khoảnh khắc đáng nhớ của chiến dịch.',
    coverImageUrl: '/assets/gallery/mhx-cover.svg',
    activityId: 'act-1',
    createdAt: '2026-05-02T00:00:00.000Z',
    photos: [
      {
        id: 'photo-1',
        albumId: 'album-1',
        imageUrl: '/assets/gallery/mhx-1.svg',
        caption: 'Ngày ra quân',
        sortOrder: 0,
      },
      {
        id: 'photo-2',
        albumId: 'album-1',
        imageUrl: '/assets/gallery/mhx-2.svg',
        caption: 'Hoạt động cộng đồng',
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'album-2',
    title: 'Tiếp sức mùa thi',
    description: null,
    coverImageUrl: '/assets/gallery/mhx-3.svg',
    activityId: null,
    createdAt: '2026-04-15T00:00:00.000Z',
    photos: [],
  },
]

export class MockGalleryDataSource implements GalleryDataSource {
  async listAlbums(): Promise<GalleryAlbumSummary[]> {
    return Promise.resolve(mockAlbums.map(({ photos: _photos, ...summary }) => summary))
  }

  async getAlbum(id: string): Promise<GalleryAlbumDetail> {
    const album = mockAlbums.find((a) => a.id === id)
    if (!album) throw new Error('Album not found')
    return Promise.resolve(album)
  }
}
