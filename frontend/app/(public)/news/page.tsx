import Link from 'next/link'
import { getArticlesDataSource, type Article } from '@/lib/datasource'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function excerpt(content: string, length = 160): string {
  const clean = content
    .replace(/[#*_`<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean
}

function articleTone(index: number): string {
  const tones = [
    'from-[#143a5a] via-[#1a56a0] to-[#78a6d8]',
    'from-[#1a56a0] via-[#0b2d57] to-[#101827]',
    'from-[#12395f] via-[#1d6fa3] to-[#dbeafe]',
    'from-[#0f172a] via-[#1a56a0] to-[#38bdf8]',
  ]
  return tones[index % tones.length]
}

function ArticleVisual({
  article,
  index,
  featured = false,
}: {
  article: Article
  index: number
  featured?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] bg-gradient-to-br ${articleTone(index)} ${featured ? 'min-h-[310px]' : 'h-44'}`}
    >
      <div
        className="absolute inset-0 bg-[url('/assets/brand/hero.svg')] bg-cover bg-center opacity-25"
        aria-hidden="true"
      />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary">
            ĐSVTN News
          </span>
          <p className="mt-2 max-w-xs text-sm font-semibold leading-5 text-white/90">
            {article.title}
          </p>
        </div>
        <span
          className="material-symbols-outlined rounded-2xl bg-white/15 p-3 text-3xl text-white backdrop-blur"
          aria-hidden="true"
        >
          newspaper
        </span>
      </div>
    </div>
  )
}

export default async function NewsPage() {
  const articles = await getArticlesDataSource().listPublished()
  const [featured, ...rest] = articles

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-[color:var(--navy)] opacity-95"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/assets/brand/hero.svg')" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground/85">
            ĐSVTN Blog & Sự kiện
          </p>
          <h1 className="text-display max-w-3xl">Tin tức &amp; Sự kiện</h1>
          <p className="max-w-2xl text-base leading-7 text-primary-foreground/85">
            Cập nhật hoạt động tình nguyện, tuyển TNV, sự kiện và các chiến dịch gây quỹ của ĐSVTN.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card
          variant="bento"
          className="-mt-16 mb-8 grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4"
        >
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Tin tức', 'Sự kiện', 'Tuyển TNV'].map((item, index) => (
              <span
                key={item}
                className={index === 0 ? 'svtn-chip' : 'svtn-chip text-muted-foreground'}
                data-tone={index === 0 ? 'primary' : undefined}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex min-h-10 items-center gap-2 rounded-xl bg-muted px-3 text-sm text-muted-foreground sm:min-w-72">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              search
            </span>
            <span>Tìm kiếm bài viết...</span>
          </div>
        </Card>

        {!featured ? (
          <div className="rounded-[var(--svtn-radius-bento)] border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-h3 text-foreground">Chưa có bài viết công khai</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng quay lại sau khi đội ngũ ĐSVTN đăng tải.
            </p>
          </div>
        ) : (
          <Link href={`/news/${featured.slug}`} className="group block">
            <Card
              variant="bento"
              interactive
              className="grid gap-6 overflow-hidden p-4 lg:grid-cols-[1.15fr_0.85fr] lg:p-5"
            >
              <ArticleVisual article={featured} index={0} featured />
              <div className="flex flex-col justify-center p-2 lg:p-6">
                <Badge tone="primary" variant="outline" className="w-fit border-transparent">
                  Bài nổi bật
                </Badge>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatDate(featured.createdAt)}
                </p>
                <h2 className="mt-3 text-h2 text-foreground group-hover:text-primary">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {excerpt(featured.content, 260)}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Đọc bài viết
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Card>
          </Link>
        )}

        {rest.length > 0 ? (
          <>
            <div className="svtn-section mt-12">
              <div>
                <h2 className="text-h2">Bài viết gần đây</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tổng hợp tin mới nhất theo ngày đăng.
                </p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, index) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                  <Card variant="bento" interactive className="h-full overflow-hidden p-0">
                    <ArticleVisual article={article} index={index + 1} />
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(article.createdAt)}
                      </p>
                      <h3 className="mt-3 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                        {article.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {excerpt(article.content)}
                      </p>
                      <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                        Đọc thêm →
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </>
  )
}
