'use client'

import { RoleShell, type ShellNavItem } from '@/components/shared/RoleShell'

const navItems: ShellNavItem[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/volunteer-applications', label: 'Đơn TNV' },
  { href: '/admin/activities', label: 'Hoạt động' },
  { href: '/admin/articles', label: 'Bài viết' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/orders', label: 'Đơn hàng' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell title="ĐSVTN Admin" navItems={navItems} allow={['ADMIN']} showBell>
      {children}
    </RoleShell>
  )
}
