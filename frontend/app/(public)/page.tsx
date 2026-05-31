import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getArticlesDataSource } from '@/lib/datasource'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

const HERO_TARGET = new Date('2026-08-01T08:00:00+07:00')

function computeCountdown(target: Date) {
  const now = Date.now()
  const diff = Math.max(0, target.getTime() - now)
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  return [
    { label: 'Ngày', value: String(days).padStart(2, '0') },
    { label: 'Giờ', value: String(hours).padStart(2, '0') },
    { label: 'Phút', value: String(minutes).padStart(2, '0') },
    { label: 'Giây', value: String(seconds).padStart(2, '0') },
  ]
}

const impactStats = [
  { value: '48', label: 'Chiến dịch' },
  { value: '1,200+', label: 'TNV' },
  { value: '15,000+', label: 'Quà tặng' },
]

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

function excerpt(content: string, length = 150): string {
  return (
    content
      .replace(/[#*_`<>]/g, '')
      .slice(0, length)
      .trim() + '…'
  )
}

const journey = [
  ['2021', 'Khởi đầu', 'Đội tình nguyện sinh viên ra đời với 30 thành viên đầu tiên.'],
  ['2022', 'Mở rộng', 'Triển khai Mùa Hè Xanh tại 3 tỉnh, 200+ TNV tham gia.'],
  ['2023', 'Số hoá', 'Áp dụng quy trình quản lý hoạt động và minh chứng số.'],
  ['2024', 'Mở rộng quỹ', 'Khởi động shop gây quỹ và minh bạch tài chính.'],
  ['2025', 'Digital Home', 'Hợp nhất các luồng vào nền tảng nội bộ + cổng công khai.'],
]

const flowSteps = [
  ['app_registration', 'Đăng ký', 'TNV gửi form, admin duyệt và cấp tài khoản theo vai trò.'],
  ['event', 'Hoạt động', 'Admin tạo hoạt động + nhiệm vụ, mở đăng ký theo nguyện vọng.'],
  ['handyman', 'Phân công', 'Greedy matcher tự động phân công và sinh waitlist công bằng.'],
  ['volunteer_activism', 'Triển khai', 'Member nhận lịch, hoàn thành nhiệm vụ, được ghi điểm.'],
]

export default async function HomePage() {
  const articles = (await getArticlesDataSource().listPublished()).slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/assets/brand/hero.svg')" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--success)]"
              aria-hidden="true"
            />
            Mùa Hè Xanh 2026 đang mở đăng ký
          </span>
          <h1 className="mt-6 max-w-4xl text-display text-foreground">
            Cùng nhau tạo nên những mùa hè ý nghĩa.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Nền tảng số hoá toàn bộ hoạt động của Đội Sinh viên Tình nguyện, kết nối trái tim tình
            nguyện và mang đến những giá trị thiết thực cho cộng đồng.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/volunteer">Đăng ký tình nguyện</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/news">
                <span className="material-symbols-outlined" aria-hidden="true">
                  play_circle
                </span>
                Xem hoạt động
              </Link>
            </Button>
          </div>
          <ul
            className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
            aria-label="Đếm ngược Mùa Hè Xanh 2026"
          >
            {computeCountdown(HERO_TARGET).map((unit) => (
              <li
                key={unit.label}
                className="flex flex-col items-center justify-center rounded-[var(--svtn-radius-bento)] border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--svtn-shadow-md)]"
              >
                <span className="text-h1 font-extrabold text-primary">{unit.value}</span>
                <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {unit.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Tác động ĐSVTN" className="bg-background">
        <div className="mx-auto grid max-w-7xl auto-rows-[minmax(140px,auto)] grid-cols-1 gap-6 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
          <div className="rounded-[var(--svtn-radius-bento)] bg-gradient-to-br from-primary to-[color:var(--navy)] p-6 text-primary-foreground shadow-[var(--svtn-shadow-md)] md:col-span-8 md:row-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              Tác động
            </p>
            <h2 className="mt-2 text-h2 text-primary-foreground">
              Hành trình 5 năm của chúng tôi.
            </h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/85">
              Lan tỏa yêu thương, kết nối cộng đồng.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {impactStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--svtn-radius-md)] bg-card p-4 text-foreground shadow-sm"
                >
                  <p className="text-h1 text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <Card
            variant="bento"
            className="flex flex-col items-center justify-center gap-2 p-6 text-center md:col-span-4"
          >
            <span
              className="material-symbols-outlined text-4xl text-[color:var(--warning)]"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              star
            </span>
            <p className="text-h1 text-foreground">4.9★</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Đánh giá trung bình từ TNV
            </p>
          </Card>
          <Card
            variant="bento"
            className="flex flex-col items-center justify-center gap-2 p-6 text-center md:col-span-4"
          >
            <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">
              calendar_month
            </span>
            <p className="text-h1 text-primary">96%</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              TNV quay lại mùa sau
            </p>
          </Card>
          <Card
            variant="bento"
            className="flex flex-col items-center justify-center gap-1 p-6 text-center md:col-span-3"
          >
            <p className="text-h1 text-primary">100%</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Minh bạch tài chính
            </p>
          </Card>
          <Card
            variant="bento"
            className="flex flex-col items-center justify-center gap-1 p-6 text-center md:col-span-3"
          >
            <p className="text-h1 text-foreground">E2E</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Số hoá toàn quy trình
            </p>
          </Card>
          <Card
            variant="bento"
            className="relative overflow-hidden bg-foreground p-6 text-background md:col-span-6"
          >
            <span
              className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-20"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              format_quote
            </span>
            <p className="relative z-10 text-base italic leading-7">
              “Đây là mùa hè ý nghĩa nhất trong 4 năm đại học của mình.”
            </p>
            <p className="relative z-10 mt-4 text-xs font-semibold uppercase tracking-wide text-background/70">
              Nguyễn Minh Anh — TNV Mùa Hè Xanh 2025
            </p>
          </Card>
        </div>
      </section>

      <section aria-label="Hành trình 5 năm" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="svtn-section">
            <div>
              <p className="svtn-eyebrow">Hành trình 5 năm</p>
              <h2 className="text-h2">Hành trình 5 năm của chúng tôi.</h2>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {journey.map(([year, title, desc], idx) => (
              <li key={year}>
                <Card variant="bento" interactive className="h-full p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-sm font-bold">{String(idx + 1).padStart(2, '0')}</span>
                    <span
                      className="h-px flex-1 bg-[color:var(--primary-soft)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-foreground">{year}</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{desc}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Quy trình tự động" className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="svtn-section">
            <div>
              <p className="svtn-eyebrow">Quy trình tự động</p>
              <h2 className="text-h2">Từ đăng ký đến phân công — tự động hoàn toàn.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Greedy matcher đảm bảo phân công công bằng, có waitlist và lịch sử minh bạch.
              </p>
            </div>
          </div>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map(([icon, title, desc], idx) => (
              <li key={title}>
                <Card variant="bento" interactive className="h-full p-5">
                  <div className="flex items-center justify-between text-primary">
                    <span
                      className="material-symbols-outlined rounded-2xl bg-[color:var(--primary-soft)] p-3"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Bước {idx + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Tin tức mới nhất" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="svtn-section">
            <div>
              <p className="svtn-eyebrow">Tin tức</p>
              <h2 className="text-h2">Tin tức mới nhất</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cập nhật hoạt động, sự kiện và các chiến dịch gây quỹ.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Tất cả tin <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bài viết công khai.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                  <Card variant="bento" interactive className="h-full p-5">
                    <p className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</p>
                    <h3 className="mt-3 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {excerpt(article.content)}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Link href="/volunteer" className="block">
            <Card
              variant="bento"
              interactive
              className="h-full bg-primary p-8 text-primary-foreground"
            >
              <h2 className="text-h2 text-primary-foreground">Trở thành tình nguyện viên.</h2>
              <p className="mt-3 text-sm leading-7 text-primary-foreground/85">
                Gửi form đăng ký, đội admin sẽ xét duyệt và cấp tài khoản nội bộ phù hợp.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                Đăng ký ngay <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
          <Link href="/shop" className="block">
            <Card variant="bento" interactive className="h-full p-8">
              <h2 className="text-h2 text-foreground">Ủng hộ qua shop gây quỹ.</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Mỗi đơn hàng có minh chứng thanh toán để logistic xác nhận minh bạch.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Tới shop <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
        </div>
      </section>
    </>
  )
}
