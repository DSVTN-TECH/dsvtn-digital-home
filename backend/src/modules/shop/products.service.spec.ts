import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PRODUCTS_REPOSITORY } from '../../common/repository'
import { ProductsRepository } from './products.repository'
import { ProductsService } from './products.service'

const baseProduct = {
  id: 'p-1',
  name: 'Áo Polo',
  description: null,
  priceCents: 150000,
  imageUrl: null,
  status: 'ACTIVE' as const,
}

describe('ProductsService', () => {
  let service: ProductsService
  let repo: jest.Mocked<
    Pick<
      ProductsRepository,
      'findById' | 'findMany' | 'findActive' | 'create' | 'update' | 'delete'
    >
  >

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findActive: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const module = await Test.createTestingModule({
      providers: [ProductsService, { provide: PRODUCTS_REPOSITORY, useValue: repo }],
    }).compile()
    service = module.get(ProductsService)
  })

  it('listActive: returns only active products', async () => {
    repo.findActive.mockResolvedValue([baseProduct])
    const result = await service.listActive()
    expect(result).toHaveLength(1)
    expect(repo.findActive).toHaveBeenCalled()
  })

  it('findOnePublic: throws NotFound for INACTIVE product', async () => {
    repo.findById.mockResolvedValue({ ...baseProduct, status: 'INACTIVE' })
    await expect(service.findOnePublic('p-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('findOnePublic: returns ACTIVE product', async () => {
    repo.findById.mockResolvedValue(baseProduct)
    const result = await service.findOnePublic('p-1')
    expect(result.id).toBe('p-1')
  })

  it('create: creates product', async () => {
    repo.create.mockResolvedValue(baseProduct)
    const result = await service.create({ name: 'Áo Polo', priceCents: 150000 })
    expect(result.name).toBe('Áo Polo')
  })

  it('update: throws NotFound when product missing', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(service.update('bad', { status: 'INACTIVE' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
