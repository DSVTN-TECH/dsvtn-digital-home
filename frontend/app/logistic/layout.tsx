'use client'

import { RoleShell, type ShellNavItem } from '@/components/shared/RoleShell'

const navItems: ShellNavItem[] = [{ href: '/logistic/orders', label: 'Đơn hàng' }]

export default function LogisticLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell title="ĐSVTN Logistic" navItems={navItems} allow={['LOGISTIC', 'ADMIN']} showBell>
      {children}
    </RoleShell>
  )
}
