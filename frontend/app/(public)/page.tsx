import Link from 'next/link'
import { getArticlesDataSource } from '@/lib/datasource/articles'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function HomePage() {
  const articles = (await getArticlesDataSource().listPublished()).slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase text-primary">ĐSVTN Digital Home</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Kết nối tình nguyện viên, hoạt động và gây quỹ trong một ngôi nhà số.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Nền tảng nội bộ và cổng công khai cho đội sinh viên tình nguyện: tuyển thành viên,
              quản lý hoạt động, phân công nhiệm vụ và vận hành shop gây quỹ.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/volunteer"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Đăng ký TNV
              </Link>
              <Link href="/news" className="rounded-md border px-4 py-2 text-sm font-medium">
                Xem tin tức
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Hoạt động trọng tâm</p>
              <p className="mt-3 text-3xl font-semibold">5 luồng</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tuyển TNV, tài khoản nội bộ, hoạt động, matcher và gây quỹ.
              </p>
            </div>
            <div className="rounded-md border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Nguyên tắc vận hành</p>
              <p className="mt-3 text-3xl font-semibold">Rõ vai trò</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Admin, member và logistic có khu vực làm việc riêng theo RBAC.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3">
          {[
            ['28', 'màn hình UI trong scope'],
            ['4', 'sprint sản phẩm chính'],
            ['100%', 'dữ liệu đơn hàng có minh chứng'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-md border bg-background p-5">
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Tin tức mới nhất</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cập nhật hoạt động, sự kiện và các chiến dịch gây quỹ của đội.
            </p>
          </div>
          <Link href="/news" className="text-sm font-medium text-primary underline">
            Tất cả tin
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="rounded-md border bg-card p-5 shadow-sm transition hover:border-primary"
            >
              <p className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{article.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {article.content.replace(/[#*_`<>]/g, '').slice(0, 150)}...
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/volunteer"
            className="rounded-md border bg-primary p-6 text-primary-foreground shadow-sm"
          >
            <h2 className="text-2xl font-semibold">Trở thành tình nguyện viên.</h2>
            <p className="mt-3 text-sm leading-6 opacity-90">
              Gửi form đăng ký để đội admin xét duyệt và cấp tài khoản nội bộ.
            </p>
          </Link>
          <Link href="/shop" className="rounded-md border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Ủng hộ qua shop gây quỹ.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Mỗi đơn hàng có proof URL để logistic xác nhận minh bạch.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
