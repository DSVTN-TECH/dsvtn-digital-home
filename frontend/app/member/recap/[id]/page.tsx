'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getGalleryDataSource } from '@/lib/datasource'
import type { GalleryAlbumDetail } from '@/lib/datasource/gallery.datasource'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3">
          <Link href="/member/recap">
            <ArrowLeft className="h-4 w-4" /> Tất cả album
          </Link>
        </Button>
        <Card variant="bento" className="p-6">
          <h1 className="text-h2 text-foreground">{album.title}</h1>
          {album.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{album.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {album.photos.length} ảnh · {new Date(album.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </Card>
      </div>

      {album.photos.length === 0 ? (
        <EmptyState title="Album trống" description="Chưa có ảnh nào trong album này." />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {album.photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <Image
                src={photo.imageUrl}
                alt={photo.caption ?? ''}
                width={800}
                height={600}
                className="w-full object-cover"
              />
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
