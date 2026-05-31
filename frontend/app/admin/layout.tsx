'use client'

import { AdminShell, type ShellNavItem } from '@/components/shared/AdminShell'
import { AdminTopBar } from '@/components/shared/AdminTopBar'
import { RoleGate } from '@/components/shared/RoleGate'

const navItems: ShellNavItem[] = [
  { href: '/admin', label: 'Tổng quan', icon: 'dashboard', exact: true },
  { href: '/admin/users', label: 'Users', icon: 'group' },
  { href: '/admin/accounts', label: 'Tài khoản & Invite', icon: 'person_add' },
  { href: '/admin/volunteer-applications', label: 'Đơn TNV', icon: 'how_to_reg' },
  { href: '/admin/activities', label: 'Hoạt động', icon: 'event' },
  { href: '/admin/articles', label: 'Tin tức (CMS)', icon: 'newspaper' },
  { href: '/admin/products', label: 'Shop & Sản phẩm', icon: 'shopping_bag' },
  { href: '/admin/orders', label: 'Đơn hàng', icon: 'receipt_long' },
  { href: '/admin/reports', label: 'Báo cáo', icon: 'analytics' },
  { href: '/admin/fundraising', label: 'Gây quỹ', icon: 'volunteer_activism' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={['ADMIN']}>
      <AdminShell
        title="ĐSVTN Admin Zone"
        navItems={navItems}
        topBar={<AdminTopBar title="ĐSVTN Admin Zone" />}
      >
        {children}
      </AdminShell>
    </RoleGate>
  )
}
