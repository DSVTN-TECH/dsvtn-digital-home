import Link from 'next/link'
import { getArticlesDataSource } from '@/lib/datasource/articles'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function NewsPage() {
  const articles = await getArticlesDataSource().listPublished()
  const [featured, ...rest] = articles

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm opacity-80">Trang chủ / Tin tức</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tin tức & Sự kiện</h1>
          <p className="mt-4 max-w-2xl leading-7 opacity-90">
            Những cập nhật mới nhất về hoạt động tình nguyện, tuyển thành viên và shop gây quỹ.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {featured ? (
          <Link
            href={`/news/${featured.slug}`}
            className="mb-8 block rounded-md border bg-card p-6 shadow-sm transition hover:border-primary"
          >
            <p className="text-sm text-muted-foreground">{formatDate(featured.createdAt)}</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              {featured.content.replace(/[#*_`<>]/g, '').slice(0, 220)}...
            </p>
          </Link>
        ) : (
          <p className="text-muted-foreground">Chưa có bài viết công khai.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="rounded-md border bg-card p-5 shadow-sm transition hover:border-primary"
            >
              <p className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{article.title}</h3>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                {article.content.replace(/[#*_`<>]/g, '').slice(0, 150)}...
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
