import { VolunteerForm } from '@/components/forms/VolunteerForm'

export default function VolunteerPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Đăng ký Tình nguyện viên</h1>
          <p className="text-sm text-muted-foreground">ĐSVTN Digital Home</p>
        </div>
        <VolunteerForm />
      </div>
    </main>
  )
}
