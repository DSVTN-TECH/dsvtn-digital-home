'use client'

import { useParams } from 'next/navigation'
import { ArticleForm } from '../ArticleForm'

export default function EditArticlePage() {
  const params = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật metadata, trạng thái và nội dung markdown.
        </p>
      </div>
      <ArticleForm articleId={params.id} />
    </div>
  )
}
