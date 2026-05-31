'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { getActivitiesDataSource } from '@/lib/datasource'
import type { Activity, ActivityStatus } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCaption,
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

const statusTone: Record<ActivityStatus, 'primary' | 'success' | 'warning' | 'info' | 'neutral'> = {
  DRAFT: 'neutral',
  OPEN: 'success',
  CLOSED: 'warning',
  MATCHED: 'info',
  COMPLETED: 'primary',
}

const activityStatusLabels: Record<ActivityStatus, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  MATCHED: 'Đã phân công',
  COMPLETED: 'Hoàn thành',
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ActivityStatus>('ALL')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) })

  async function fetchList() {
    setStatus('loading')
    try {
      setActivities(await getActivitiesDataSource().list())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredActivities = activities.filter((activity) => {
    const matchesStatus = statusFilter === 'ALL' || activity.status === statusFilter
    const matchesSearch = normalizedSearch
      ? activity.title.toLowerCase().includes(normalizedSearch)
      : true
    return matchesStatus && matchesSearch
  })

  async function onSubmit(values: CreateForm) {
    setError(null)
    try {
      await getActivitiesDataSource().create({
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
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Hoạt động</p>
          <h1 className="text-h1">Quản lý hoạt động</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo hoạt động, theo dõi trạng thái và cấu hình đầu việc.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Huỷ
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Tạo hoạt động
            </>
          )}
        </Button>
      </div>

      {showForm ? (
        <Card variant="bento" className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Thông tin hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tiêu đề" htmlFor="title" required error={errors.title?.message}>
                <Input id="title" invalid={!!errors.title} {...register('title')} />
              </FormField>
              <FormField label="Mô tả" htmlFor="description" error={errors.description?.message}>
                <Input
                  id="description"
                  invalid={!!errors.description}
                  {...register('description')}
                />
              </FormField>
              <FormField
                label="Bắt đầu"
                htmlFor="startTime"
                required
                error={errors.startTime?.message}
              >
                <Input
                  id="startTime"
                  type="datetime-local"
                  invalid={!!errors.startTime}
                  {...register('startTime')}
                />
              </FormField>
              <FormField
                label="Kết thúc"
                htmlFor="endTime"
                required
                error={errors.endTime?.message}
              >
                <Input
                  id="endTime"
                  type="datetime-local"
                  invalid={!!errors.endTime}
                  {...register('endTime')}
                />
              </FormField>
              {error ? (
                <p role="alert" className="sm:col-span-2 text-sm font-semibold text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo hoạt động'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <ErrorState onRetry={fetchList} />
      ) : activities.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động"
          description="Tạo hoạt động đầu tiên ở nút phía trên."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              ariaLabel="Lọc theo trạng thái"
              variant="pill"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'ALL' | ActivityStatus)}
              items={[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'DRAFT', label: 'Nháp' },
                { value: 'OPEN', label: 'Đang mở' },
                { value: 'CLOSED', label: 'Đã đóng' },
                { value: 'MATCHED', label: 'Đã ghép' },
                { value: 'COMPLETED', label: 'Hoàn thành' },
              ]}
            />
            <label className="relative block lg:w-64" htmlFor="activity-search">
              <span className="sr-only">Tìm hoạt động theo tiêu đề</span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                search
              </span>
              <Input
                id="activity-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tiêu đề"
                className="pl-10"
              />
            </label>
          </div>
          {filteredActivities.length === 0 ? (
            <EmptyState
              title="Không có hoạt động khớp"
              description="Hãy đổi bộ lọc hoặc từ khoá tìm kiếm."
            />
          ) : (
            <Card variant="bento" className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Danh sách hoạt động ĐSVTN.</TableCaption>
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
                    {filteredActivities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-semibold text-foreground">{a.title}</TableCell>
                        <TableCell>
                          <Badge tone={statusTone[a.status]}>
                            {activityStatusLabels[a.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(a.startTime).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(a.endTime).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/activities/${a.id}`}>Xem</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
