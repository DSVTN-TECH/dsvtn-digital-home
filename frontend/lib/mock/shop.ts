import type { AdminOrder, Product } from '@/lib/datasource/shop.datasource'

export const mockProducts: Product[] = [
  {
    id: '00000000-0000-0000-0000-0000000000a1',
    name: 'Áo polo SVTN 2026',
    description: 'Áo polo cotton, in logo SVTN, các size S/M/L/XL.',
    priceCents: 180000,
    imageUrl: '/assets/products/polo.svg',
    status: 'ACTIVE',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-0000000000a2',
    name: 'Mũ lưỡi trai SVTN',
    description: 'Mũ vải, thêu logo SVTN.',
    priceCents: 90000,
    imageUrl: '/assets/products/cap.svg',
    status: 'ACTIVE',
    createdAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-0000000000a3',
    name: 'Túi vải tote',
    description: 'Túi tote canvas, in slogan tình nguyện.',
    priceCents: 65000,
    imageUrl: '/assets/products/tote.svg',
    status: 'ACTIVE',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
]

export const mockOrders: AdminOrder[] = [
  {
    id: '00000000-0000-0000-0000-000000000301',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    paymentProofUrl: 'https://example.com/proofs/order-301',
    status: 'PENDING_PAYMENT_REVIEW',
    createdAt: '2026-05-28T09:30:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000302',
    customerName: 'Trần Thị B',
    customerPhone: '0902345678',
    customerAddress: '45 Lê Lợi, Quận 3, TP.HCM',
    paymentProofUrl: 'https://example.com/proofs/order-302',
    status: 'CONFIRMED',
    createdAt: '2026-05-27T14:15:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000303',
    customerName: 'Lê Minh C',
    customerPhone: '0903456789',
    customerAddress: 'Ký túc xá Khu B, Dĩ An, Bình Dương',
    paymentProofUrl: 'https://example.com/proofs/order-303',
    status: 'DELIVERED',
    createdAt: '2026-05-26T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000304',
    customerName: 'Phạm Anh D',
    customerPhone: '0904567890',
    customerAddress: '10 Võ Văn Ngân, TP. Thủ Đức',
    paymentProofUrl: 'https://example.com/proofs/order-304',
    status: 'REJECTED',
    createdAt: '2026-05-25T16:45:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000305',
    customerName: 'Vũ Hoàng E',
    customerPhone: '0905678901',
    customerAddress: '12 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    paymentProofUrl: 'https://example.com/proofs/order-305',
    status: 'CANCELLED',
    createdAt: '2026-05-24T11:20:00.000Z',
  },
]
