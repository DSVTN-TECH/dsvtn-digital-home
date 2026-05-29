'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
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
} from '@/lib/datasource/shop'

const emptyForm: ProductFormInput = {
  name: '',
  description: '',
  priceCents: 0,
  imageUrl: '',
  status: 'ACTIVE',
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Math.round(cents / 100),
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductFormInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refetch() {
    setLoading(true)
    setError(null)
    try {
      setProducts(await getShopDataSource().listAllProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải sản phẩm thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

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
        priceCents: Number(form.priceCents),
      }
      if (!input.name || input.priceCents <= 0) {
        setError('Tên sản phẩm và giá lớn hơn 0 là bắt buộc')
        return
      }
      if (editingId) {
        await getShopDataSource().updateProduct(editingId, input)
      } else {
        await getShopDataSource().createProduct(input)
      }
      setEditingId(null)
      setForm(emptyForm)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu sản phẩm thất bại')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(product: Product) {
    const status: ProductStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setError(null)
    try {
      const updated = await getShopDataSource().updateProduct(product.id, { status })
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đổi trạng thái thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản lý sản phẩm</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo sản phẩm gây quỹ, chỉnh giá và bật/tắt hiển thị ngoài shop.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-md border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceCents">Giá (_cents) *</Label>
            <Input
              id="priceCents"
              type="number"
              min={1}
              value={form.priceCents}
              onChange={(event) =>
                setForm((current) => ({ ...current, priceCents: Number(event.target.value) }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              value={form.description ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as ProductStatus }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
          {editingId && (
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
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-muted-foreground">Đang tải sản phẩm...</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Giá hiển thị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(product.priceCents)}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(product)}>
                        {product.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
