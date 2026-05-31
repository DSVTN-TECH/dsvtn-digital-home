'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
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
import {
  getShopDataSource,
  type Product,
  type ProductFormInput,
  type ProductStatus,
} from '@/lib/datasource'

const emptyForm: ProductFormInput = {
  name: '',
  description: '',
  priceCents: 0,
  imageUrl: '',
  status: 'ACTIVE',
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductFormInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductStatus>('ALL')

  async function refetch() {
    setStatus('loading')
    setError(null)
    try {
      setProducts(await getShopDataSource().listAllProducts())
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải sản phẩm thất bại')
      setStatus('error')
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const visibleProducts = products.filter((product) => {
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter
    const matchesSearch = normalizedSearch
      ? [product.name, product.description ?? ''].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        )
      : true
    return matchesStatus && matchesSearch
  })

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      priceCents: product.priceCents,
      imageUrl: product.imageUrl ?? '',
      status: product.status,
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const input = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
      }
      const ds = getShopDataSource()
      if (editingId) await ds.updateProduct(editingId, input)
      else await ds.createProduct(input)
      setForm(emptyForm)
      setEditingId(null)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu sản phẩm thất bại')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(product: Product) {
    setSaving(true)
    try {
      await getShopDataSource().updateProduct(product.id, {
        status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      })
      await refetch()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Shop &amp; Sản phẩm</p>
          <h1 className="text-h1">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo sản phẩm gây quỹ, chỉnh giá và bật/tắt hiển thị ngoài shop.
          </p>
        </div>
      </div>

      <Card variant="bento" className="p-0">
        <CardHeader className="p-6">
          <CardTitle>{editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <FormField label="Tên sản phẩm" htmlFor="product-name" required>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))}
              />
            </FormField>
            <FormField
              label="Giá (VND)"
              htmlFor="product-price"
              required
              help="Đơn vị nhỏ nhất khi lưu là cents (×100)."
            >
              <Input
                id="product-price"
                type="number"
                min={1}
                value={form.priceCents}
                onChange={(e) => setForm((cur) => ({ ...cur, priceCents: Number(e.target.value) }))}
              />
            </FormField>
            <FormField label="Mô tả" htmlFor="product-desc">
              <Input
                id="product-desc"
                value={form.description ?? ''}
                onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
              />
            </FormField>
            <FormField label="Image URL" htmlFor="product-image" help="Liên kết https công khai.">
              <Input
                id="product-image"
                value={form.imageUrl ?? ''}
                onChange={(e) => setForm((cur) => ({ ...cur, imageUrl: e.target.value }))}
              />
            </FormField>
            <FormField label="Trạng thái" htmlFor="product-status">
              <Select
                id="product-status"
                value={form.status}
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, status: e.target.value as ProductStatus }))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </Select>
            </FormField>
            {error ? (
              <p role="alert" className="md:col-span-2 text-sm font-semibold text-destructive">
                {error}
              </p>
            ) : null}
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo sản phẩm'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                >
                  Huỷ
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <ErrorState onRetry={refetch} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm"
          description="Tạo sản phẩm đầu tiên ở khung bên trên."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((value) => (
                <Button
                  key={value}
                  variant={statusFilter === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(value)}
                >
                  {value === 'ALL' ? 'Tất cả' : value === 'ACTIVE' ? 'Đang bán' : 'Tắt'}
                </Button>
              ))}
            </div>
            <label className="relative block lg:w-64" htmlFor="product-search">
              <span className="sr-only">Tìm sản phẩm</span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                search
              </span>
              <Input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc mô tả"
                className="pl-10"
              />
            </label>
          </div>
          {visibleProducts.length === 0 ? (
            <EmptyState
              title="Không có sản phẩm khớp"
              description="Hãy đổi bộ lọc hoặc từ khoá tìm kiếm."
            />
          ) : (
            <Card variant="bento" className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Danh sách sản phẩm shop gây quỹ.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className={product.status === 'INACTIVE' ? 'opacity-60' : undefined}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-secondary">
                              <Image
                                src={product.imageUrl ?? '/assets/products/polo.svg'}
                                alt=""
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {product.name}
                              </p>
                              {product.description ? (
                                <p className="truncate text-xs text-muted-foreground">
                                  {product.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatPrice(product.priceCents)}
                        </TableCell>
                        <TableCell>
                          <Badge tone={product.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {product.status === 'ACTIVE' ? 'Đang bán' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus(product)}
                              disabled={saving}
                            >
                              {product.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                            </Button>
                          </div>
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
