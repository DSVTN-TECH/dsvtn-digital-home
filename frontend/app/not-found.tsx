import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="text-h2 text-foreground">Không tìm thấy trang</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển. Hãy quay lại trang chủ ĐSVTN.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Trang chủ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/news">Xem tin tức</Link>
        </Button>
      </div>
    </main>
  )
}
