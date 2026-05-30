'use client'

import { RoleShell, type ShellNavItem } from '@/components/shared/RoleShell'

const navItems: ShellNavItem[] = [
  { href: '/member/feed', label: 'Bảng tin' },
  { href: '/member/activities', label: 'Hoạt động' },
  { href: '/member/assignments', label: 'Phân công' },
  { href: '/member/notifications', label: 'Thông báo' },
  { href: '/member/profile', label: 'Hồ sơ' },
  { href: '/member/streak', label: 'Điểm & xếp hạng' },
  { href: '/member/recap', label: 'Recap' },
  { href: '/member/impact', label: 'Tác động' },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell
      title="ĐSVTN Member"
      navItems={navItems}
      allow={['MEMBER', 'ADMIN']}
      showBell
      notificationsHref="/member/notifications"
    >
      {children}
    </RoleShell>
  )
}
