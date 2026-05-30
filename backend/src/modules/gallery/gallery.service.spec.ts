import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CacheService } from '../../common/cache'
import { GALLERY_REPOSITORY } from '../../common/repository'
import { GalleryRepository } from './gallery.repository'
import { GalleryService } from './gallery.service'

describe('GalleryService', () => {
  let service: GalleryService
  let repo: jest.Mocked<GalleryRepository>
  let cache: { getOrSet: jest.Mock; invalidate: jest.Mock }

  beforeEach(async () => {
    repo = {
      listAlbums: jest.fn().mockResolvedValue([]),
      findAlbum: jest.fn(),
      createAlbum: jest.fn(),
      updateAlbum: jest.fn(),
      addPhoto: jest.fn(),
      findPhoto: jest.fn(),
      removePhoto: jest.fn(),
    } as unknown as jest.Mocked<GalleryRepository>
    cache = {
      getOrSet: jest.fn((_key, factory) => factory()),
      invalidate: jest.fn().mockResolvedValue(1),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        GalleryService,
        { provide: GALLERY_REPOSITORY, useValue: repo },
        { provide: CacheService, useValue: cache },
      ],
    }).compile()
    service = moduleRef.get(GalleryService)
  })

  it('getPublic throws NotFound for unknown album', async () => {
    repo.findAlbum.mockResolvedValue(null)
    await expect(service.getPublic('missing')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('create invalidates the gallery list cache', async () => {
    repo.createAlbum.mockResolvedValue({ id: 'a1' } as never)
    await service.create({ title: 'Recap' }, 'admin-1')
    expect(cache.invalidate).toHaveBeenCalledWith('cache:gallery:albums')
    expect(cache.invalidate).toHaveBeenCalledWith('cache:gallery:album:a1')
  })

  it('addPhoto requires an existing album', async () => {
    repo.findAlbum.mockResolvedValue(null)
    await expect(
      service.addPhoto('missing', { imageUrl: 'https://x/y.jpg' }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(repo.addPhoto).not.toHaveBeenCalled()
  })

  it('removePhoto invalidates cache for the parent album', async () => {
    repo.findPhoto.mockResolvedValue({ id: 'p1', albumId: 'a1' } as never)
    await service.removePhoto('p1')
    expect(repo.removePhoto).toHaveBeenCalledWith('p1')
    expect(cache.invalidate).toHaveBeenCalledWith('cache:gallery:album:a1')
  })
})
