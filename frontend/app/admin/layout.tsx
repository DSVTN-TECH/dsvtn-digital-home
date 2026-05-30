'use client'

import { RoleShell, type ShellNavItem } from '@/components/shared/RoleShell'
import { AdminTopBar } from '@/components/shared/AdminTopBar'

const navItems: ShellNavItem[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/accounts', label: 'Tài khoản' },
  { href: '/admin/volunteer-applications', label: 'Đơn TNV' },
  { href: '/admin/activities', label: 'Hoạt động' },
  { href: '/admin/articles', label: 'Bài viết' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/reports', label: 'Báo cáo' },
  { href: '/admin/fundraising', label: 'Gây quỹ' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell title="ĐSVTN Admin" navItems={navItems} allow={['ADMIN']} header={<AdminTopBar />}>
      {children}
    </RoleShell>
  )
}
