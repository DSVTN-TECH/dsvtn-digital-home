'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getGalleryDataSource } from '@/lib/datasource'
import type { GalleryAlbumSummary } from '@/lib/datasource/gallery.datasource'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'

const filters = ['Tất cả', 'Mùa hè xanh', 'Ánh sáng', 'Thiện Tâm', 'Nội bộ']

export default function MemberRecapPage() {
  const dataSource = getGalleryDataSource()
  const [albums, setAlbums] = useState<GalleryAlbumSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [search, setSearch] = useState('')

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

  const normalizedSearch = search.trim().toLowerCase()
  const filteredAlbums = normalizedSearch
    ? albums.filter((album) =>
        [album.title, album.description ?? ''].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
    : albums

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card
        variant="bento"
        className="relative overflow-hidden bg-[#162033] p-8 text-white sm:p-10"
      >
        <div
          className="absolute inset-0 bg-[url('/assets/brand/hero.svg')] bg-cover bg-center opacity-15"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 h-3 w-32 rounded-full bg-white/90" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Recap Gallery
          </p>
          <h1 className="mt-3 text-display text-white">Ký ức của chúng ta 📸</h1>
          <p className="mt-3 text-sm leading-6 text-white/72">
            Nơi lưu giữ những khoảnh khắc đẹp nhất của chiến dịch, hoạt động tình nguyện và những
            câu chuyện đáng nhớ của đội ĐSVTN.
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <span
              key={filter}
              className="svtn-chip"
              data-tone={index === 0 ? 'primary' : undefined}
            >
              {filter}
            </span>
          ))}
        </div>
        <label className="relative block w-full max-w-md" htmlFor="recap-search">
          <span className="sr-only">Tìm kiếm album</span>
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            search
          </span>
          <Input
            id="recap-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm chiến dịch..."
            className="pl-10"
          />
        </label>
      </div>

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : albums.length === 0 ? (
        <EmptyState title="Chưa có album" description="Các recap sẽ xuất hiện tại đây." />
      ) : filteredAlbums.length === 0 ? (
        <EmptyState title="Không có album khớp" description="Hãy thử từ khoá khác." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlbums.map((album, index) => (
            <Link key={album.id} href={`/member/recap/${album.id}`} className="group block">
              <Card variant="bento" interactive className="overflow-hidden p-0">
                <div
                  className={
                    index % 3 === 0
                      ? 'relative aspect-[4/5] overflow-hidden bg-muted'
                      : 'relative aspect-[4/3] overflow-hidden bg-muted'
                  }
                >
                  <Image
                    src={album.coverImageUrl ?? '/assets/gallery/mhx-cover.svg'}
                    alt=""
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                      Album recap
                    </span>
                    <h2 className="mt-3 text-lg font-extrabold">{album.title}</h2>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {album.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {album.description}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
                    <span>{new Date(album.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className="font-semibold text-primary">Xem recap →</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
