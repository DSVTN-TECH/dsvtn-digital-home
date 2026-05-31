import { PublicShell } from '@/components/shared/PublicShell'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>
}
