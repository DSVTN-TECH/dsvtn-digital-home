import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MarkdownView } from '@/components/shared/MarkdownView'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getArticlesDataSource, type Article } from '@/lib/datasource'

export const dynamic = 'force-dynamic'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function excerpt(content: string, length = 140): string {
  const clean = content
    .replace(/[#*_`<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean
}

function ArticleHeroVisual({ article }: { article: Article }) {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f172a] via-primary to-[#7aa7d7] shadow-[var(--svtn-shadow-md)]">
      <div
        className="absolute inset-0 bg-[url('/assets/brand/hero.svg')] bg-cover bg-center opacity-25"
        aria-hidden="true"
      />
      <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="bg-white text-primary">ĐSVTN Story</Badge>
          <p className="mt-3 max-w-lg text-2xl font-extrabold leading-tight text-white">
            {article.title}
          </p>
        </div>
        <span
          className="material-symbols-outlined rounded-3xl bg-white/15 p-4 text-4xl text-white backdrop-blur"
          aria-hidden="true"
        >
          campaign
        </span>
      </div>
    </div>
  )
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticlesDataSource().findPublished(id)
  if (!article) notFound()

  const all = await getArticlesDataSource().listPublished()
  const related = all.filter((a) => a.id !== article.id).slice(0, 3)

  return (
    <>
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-5">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" /> Quay lại tin tức
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge tone="primary" variant="outline" className="border-transparent">
                  Tin tức
                </Badge>
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <h1 className="max-w-4xl text-h1 text-foreground">{article.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {excerpt(article.content, 220)}
              </p>
            </header>

            <ArticleHeroVisual article={article} />

            <Card variant="bento" className="p-6 sm:p-8">
              <MarkdownView content={article.content} />
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card variant="bento" className="p-5">
              <p className="svtn-eyebrow">Tóm tắt</p>
              <h2 className="mt-2 text-h3">Những nhịp chính</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> Hoạt
                  động được ghi nhận minh bạch trong hệ thống.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> Thành
                  viên và hậu cần phối hợp theo vai trò rõ ràng.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> Dữ
                  liệu recap hỗ trợ cải thiện các chiến dịch sau.
                </li>
              </ul>
            </Card>
            <Card variant="soft" className="p-5">
              <p className="text-sm font-semibold text-foreground">
                Muốn tham gia hoạt động tiếp theo?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Gửi form tình nguyện để đội admin xét duyệt và cấp tài khoản nội bộ.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/volunteer">Đăng ký TNV</Link>
              </Button>
            </Card>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="svtn-section">
            <div>
              <h2 className="text-h2">Khám phá thêm</h2>
              <p className="mt-1 text-sm text-muted-foreground">Các bài viết khác từ ĐSVTN.</p>
            </div>
            <Link href="/news" className="text-sm font-semibold text-primary hover:underline">
              Tất cả tin →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((rel, index) => (
              <Link key={rel.id} href={`/news/${rel.slug}`} className="group block">
                <Card variant="bento" interactive className="h-full overflow-hidden p-0">
                  <div
                    className={`h-36 bg-gradient-to-br ${index === 0 ? 'from-primary to-[#0f172a]' : index === 1 ? 'from-[#0f766e] to-primary' : 'from-[#7c3aed] to-primary'}`}
                  >
                    <div className="flex h-full items-end p-4 text-white">
                      <span
                        className="material-symbols-outlined rounded-2xl bg-white/15 p-2"
                        aria-hidden="true"
                      >
                        article
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">{formatDate(rel.createdAt)}</p>
                    <h3 className="mt-3 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                      {rel.title}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
