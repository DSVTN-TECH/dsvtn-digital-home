import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ĐSVTN Digital Home',
  description: 'Hệ thống backoffice và cổng thông tin công khai cho Đội Sinh viên Tình nguyện',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
