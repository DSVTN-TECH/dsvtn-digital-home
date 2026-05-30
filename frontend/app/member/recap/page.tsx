'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getGalleryDataSource } from '@/lib/datasource'
import type { GalleryAlbumSummary } from '@/lib/datasource/gallery.datasource'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

export default function MemberRecapPage() {
  const dataSource = getGalleryDataSource()
  const [albums, setAlbums] = useState<GalleryAlbumSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setAlbums(await dataSource.listAlbums())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <ErrorState onRetry={load} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recap kỷ niệm</h1>
        <p className="text-sm text-muted-foreground">Album ảnh từ các hoạt động ĐSVTN.</p>
      </div>

      {albums.length === 0 ? (
        <EmptyState title="Chưa có album" description="Các recap sẽ xuất hiện tại đây." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/member/recap/${album.id}`}
              className="overflow-hidden rounded-lg border transition-colors hover:bg-accent"
            >
              <div className="aspect-video bg-muted">
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h2 className="font-medium">{album.title}</h2>
                {album.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{album.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
