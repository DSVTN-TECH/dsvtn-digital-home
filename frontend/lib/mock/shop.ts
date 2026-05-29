import type { Product } from '@/lib/datasource/shop'

export const mockProducts: Product[] = [
  {
    id: '00000000-0000-0000-0000-0000000000a1',
    name: 'Áo polo SVTN 2026',
    description: 'Áo polo cotton, in logo SVTN, các size S/M/L/XL.',
    priceCents: 18000000,
    imageUrl: null,
    status: 'ACTIVE',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-0000000000a2',
    name: 'Mũ lưỡi trai SVTN',
    description: 'Mũ vải, thêu logo SVTN.',
    priceCents: 9000000,
    imageUrl: null,
    status: 'ACTIVE',
    createdAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-0000000000a3',
    name: 'Túi vải tote',
    description: 'Túi tote canvas, in slogan tình nguyện.',
    priceCents: 6500000,
    imageUrl: null,
    status: 'ACTIVE',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
]
