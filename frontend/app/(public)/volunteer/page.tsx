import { VolunteerForm } from '@/components/forms/VolunteerForm'
import { Card } from '@/components/ui/card'

const highlights = [
  ['groups', 'Cộng đồng', 'Kết nối với đội hình sinh viên cùng tinh thần phục vụ.'],
  ['event_available', 'Hoạt động', 'Đăng ký chiến dịch, workshop và nhiệm vụ theo lịch rõ ràng.'],
  ['auto_awesome_motion', 'Phân công', 'Matcher gợi ý nhiệm vụ phù hợp kỹ năng và thời gian rảnh.'],
]

const steps = ['Thông tin cá nhân', 'Nguyện vọng', 'Xác nhận']

export default function VolunteerPage() {
  return (
    <section className="relative overflow-hidden bg-[#dbe7f4] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url('/assets/brand/hero.svg')" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <aside className="overflow-hidden rounded-[32px] bg-gradient-to-br from-primary to-[color:var(--navy)] p-7 text-primary-foreground shadow-[var(--svtn-shadow-lg)] lg:sticky lg:top-24 lg:min-h-[720px] lg:p-10">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground/90">
                <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
                Mùa Hè Xanh 2026
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
                  Cổng đăng ký
                </p>
                <h1 className="text-display max-w-xl text-primary-foreground">
                  Tham gia cùng chúng tôi.
                </h1>
                <p className="max-w-xl text-base leading-7 text-primary-foreground/80">
                  Từ một form đăng ký, đội ĐSVTN sẽ xét duyệt, cấp tài khoản nội bộ và phân công bạn
                  vào hoạt động phù hợp.
                </p>
              </div>
              <div className="grid gap-3">
                {highlights.map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-3xl bg-white/10 p-4 ring-1 ring-white/10"
                  >
                    <span
                      className="material-symbols-outlined mt-0.5 rounded-2xl bg-white/10 p-2 text-[22px]"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-primary-foreground">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/70">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-white/10 bg-white/10 p-5 text-primary-foreground shadow-none backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
                Deadline ưu tiên
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  ['14', 'ngày'],
                  ['08', 'giờ'],
                  ['45', 'phút'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </aside>

        <div className="space-y-5">
          <Card variant="bento" className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="svtn-eyebrow">Đăng ký TNV</p>
                <h2 className="mt-1 text-h2 text-foreground">Thông tin xét duyệt</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hoàn thành các nhóm thông tin để đội admin xét duyệt nhanh hơn.
                </p>
              </div>
              <ol className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-muted-foreground sm:min-w-80">
                {steps.map((step, index) => (
                  <li key={step} className="rounded-2xl bg-muted px-3 py-2">
                    <span className="block text-primary">0{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </Card>
          <VolunteerForm />
        </div>
      </div>
    </section>
  )
}
