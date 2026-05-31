'use client'

import { AdminShell, type ShellNavItem } from '@/components/shared/AdminShell'
import { AdminTopBar } from '@/components/shared/AdminTopBar'
import { RoleGate } from '@/components/shared/RoleGate'

const navItems: ShellNavItem[] = [
  { href: '/logistic/orders', label: 'Đơn hàng', icon: 'receipt_long' },
]

export default function LogisticLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={['LOGISTIC', 'ADMIN']}>
      <AdminShell
        title="ĐSVTN Logistic"
        brand="ĐSVTN Logistic"
        navItems={navItems}
        topBar={<AdminTopBar title="Hàng đợi đơn hàng" />}
      >
        {children}
      </AdminShell>
    </RoleGate>
  )
}
