import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarkdownView } from '@/components/shared/MarkdownView'
import { getArticlesDataSource } from '@/lib/datasource/articles'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticlesDataSource().findPublished(id)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-md border bg-background p-6 shadow-sm md:p-10">
        <Link href="/news" className="text-sm text-primary underline">
          Quay lại tin tức
        </Link>
        <p className="mt-8 text-sm text-muted-foreground">{formatDate(article.createdAt)}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{article.title}</h1>
        <div className="mt-8 border-t pt-2">
          <MarkdownView content={article.content} />
        </div>
      </article>
    </main>
  )
}
