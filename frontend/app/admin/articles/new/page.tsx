import { ArticleForm } from '../ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Soạn nội dung markdown và xem preview trước khi xuất bản.
        </p>
      </div>
      <ArticleForm />
    </div>
  )
}
