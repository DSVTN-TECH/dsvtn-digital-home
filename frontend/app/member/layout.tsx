'use client'

import { MemberShell, type ShellNavItem } from '@/components/shared/MemberShell'
import { RoleGate } from '@/components/shared/RoleGate'

const navItems: ShellNavItem[] = [
  { href: '/member/feed', icon: 'dynamic_feed', label: 'Bảng tin' },
  { href: '/member/activities', icon: 'volunteer_activism', label: 'Hoạt động' },
  { href: '/member/assignments', icon: 'assignment_ind', label: 'Phân công' },
  { href: '/member/notifications', icon: 'notifications', label: 'Thông báo' },
  { href: '/member/profile', icon: 'person', label: 'Hồ sơ' },
  { href: '/member/streak', icon: 'leaderboard', label: 'Điểm & xếp hạng' },
  { href: '/member/recap', icon: 'photo_library', label: 'Recap' },
  { href: '/member/impact', icon: 'favorite', label: 'Tác động' },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={['MEMBER', 'ADMIN']}>
      <MemberShell navItems={navItems} notificationsHref="/member/notifications">
        {children}
      </MemberShell>
    </RoleGate>
  )
}
