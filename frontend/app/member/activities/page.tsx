'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMemberActivitiesDataSource } from '@/lib/datasource'
import type { Activity } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function MemberActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMemberActivitiesDataSource()
      .listOpen()
      .then(setActivities)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hoạt động đang mở</h1>

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : activities.length === 0 ? (
        <p className="text-muted-foreground">Không có hoạt động nào đang mở.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Kết thúc</TableHead>
              <TableHead className="text-right">Đăng ký</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{a.status}</Badge>
                </TableCell>
                <TableCell>{new Date(a.startTime).toLocaleString('vi-VN')}</TableCell>
                <TableCell>{new Date(a.endTime).toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/member/activities/${a.id}`}
                    className="text-sm text-primary underline"
                  >
                    Xem & Đăng ký
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
