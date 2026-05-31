import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ĐSVTN Digital Home',
  description: 'Hệ thống backoffice và cổng thông tin công khai cho Đội Sinh viên Tình nguyện',
  icons: { icon: '/assets/brand/favicon.svg' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable @next/next/no-page-custom-font -- App Router root layout is the canonical place for global webfonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
        {/* eslint-enable @next/next/no-page-custom-font */}
      </head>
      <body>{children}</body>
    </html>
  )
}
