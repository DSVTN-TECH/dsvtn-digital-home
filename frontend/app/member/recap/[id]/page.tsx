'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getGalleryDataSource } from '@/lib/datasource'
import type { GalleryAlbumDetail } from '@/lib/datasource/gallery.datasource'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

export default function RecapAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const dataSource = getGalleryDataSource()
  const [album, setAlbum] = useState<GalleryAlbumDetail | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setAlbum(await dataSource.getAlbum(id))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource, id])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || !album) return <ErrorState onRetry={load} />

  return (
    <div className="space-y-6">
      <div>
        <Link href="/member/recap" className="text-sm text-primary underline">
          ← Tất cả album
        </Link>
        <h1 className="pt-2 text-2xl font-semibold">{album.title}</h1>
        {album.description ? (
          <p className="text-sm text-muted-foreground">{album.description}</p>
        ) : null}
      </div>

      {album.photos.length === 0 ? (
        <EmptyState title="Album trống" description="Chưa có ảnh nào trong album này." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {album.photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-lg border">
              <div className="aspect-square bg-muted">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption ?? ''}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {photo.caption ? (
                <figcaption className="p-3 text-sm text-muted-foreground">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
