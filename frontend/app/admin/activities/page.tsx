'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { getActivitiesDataSource } from '@/lib/datasource'
import type { Activity } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const createSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
  endTime: z.string().min(1, 'Thời gian kết thúc là bắt buộc'),
})
type CreateForm = z.infer<typeof createSchema>

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  })

  async function fetchList() {
    setLoading(true)
    try {
      const ds = getActivitiesDataSource()
      setActivities(await ds.list())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  async function onSubmit(values: CreateForm) {
    setError(null)
    try {
      const ds = getActivitiesDataSource()
      await ds.create({
        ...values,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
      })
      reset()
      setShowForm(false)
      await fetchList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hoạt động</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Huỷ' : 'Tạo hoạt động'}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border bg-card p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Bắt đầu *</Label>
              <Input id="startTime" type="datetime-local" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Kết thúc *</Label>
              <Input id="endTime" type="datetime-local" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo'}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : activities.length === 0 ? (
        <p className="text-muted-foreground">Chưa có hoạt động.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Kết thúc</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
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
                    href={`/admin/activities/${a.id}`}
                    className="text-sm text-primary underline"
                  >
                    Xem
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
