import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test } from '@nestjs/testing'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { LockService } from '../../common/lock'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { OrdersService, isAllowedOrderTransition } from './orders.service'

const activeProduct = {
  id: 'p-1',
  name: 'Polo',
  description: null,
  priceCents: 150000,
  imageUrl: null,
  status: 'ACTIVE' as const,
}
const baseOrder = {
  id: 'o-1',
  customerName: 'A',
  customerPhone: '0912345678',
  customerAddress: 'HCM',
  paymentProofUrl: 'https://example.com',
  status: 'PENDING_PAYMENT_REVIEW' as const,
  emailStatus: 'NOT_CONFIGURED' as const,
  createdAt: new Date(),
  items: [],
}

describe('OrdersService', () => {
  let service: OrdersService
  let productsRepo: { findById: jest.Mock }
  let ordersRepo: {
    create: jest.Mock
    findAll: jest.Mock
    findById: jest.Mock
    updateStatus: jest.Mock
    updateEmailStatus: jest.Mock
  }
  let emailProvider: jest.Mocked<EmailProvider>

  beforeEach(async () => {
    productsRepo = { findById: jest.fn() }
    ordersRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateEmailStatus: jest.fn(),
    }
    emailProvider = { sendConfirmation: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PRODUCTS_REPOSITORY, useValue: productsRepo },
        { provide: ORDERS_REPOSITORY, useValue: ordersRepo },
        { provide: EMAIL_PROVIDER, useValue: emailProvider },
        {
          provide: LockService,
          useValue: {
            withLock: jest.fn((_resource, _ttl, fn) => fn()),
          },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile()
    service = module.get(OrdersService)
  })

  it('create: creates order with snapshotted price', async () => {
    productsRepo.findById.mockResolvedValue(activeProduct)
    ordersRepo.create.mockResolvedValue(baseOrder)
    emailProvider.sendConfirmation.mockResolvedValue('NOT_CONFIGURED')
    ordersRepo.updateEmailStatus.mockResolvedValue(baseOrder)

    const result = await service.create({
      customerName: 'A',
      customerPhone: '0912345678',
      customerAddress: 'HCM',
      paymentProofUrl: 'https://example.com',
      items: [{ productId: 'p-1', quantity: 2 }],
    })

    expect(result.status).toBe('PENDING_PAYMENT_REVIEW')
    expect(ordersRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ productId: 'p-1', quantity: 2, unitPriceCents: 150000 }],
      }),
    )
    expect(ordersRepo.updateEmailStatus).toHaveBeenCalledWith('o-1', 'NOT_CONFIGURED')
  })

  it('create: email failure does not rollback order', async () => {
    productsRepo.findById.mockResolvedValue(activeProduct)
    ordersRepo.create.mockResolvedValue(baseOrder)
    emailProvider.sendConfirmation.mockRejectedValue(new Error('provider down'))
    ordersRepo.updateEmailStatus.mockResolvedValue({ ...baseOrder, emailStatus: 'FAILED' })

    const result = await service.create({
      customerName: 'A',
      customerPhone: '0912345678',
      customerAddress: 'HCM',
      paymentProofUrl: 'https://example.com',
      items: [{ productId: 'p-1', quantity: 1 }],
    })

    expect(result.id).toBe(baseOrder.id)
    expect(ordersRepo.updateEmailStatus).toHaveBeenCalledWith('o-1', 'FAILED')
  })

  it('create: throws UnprocessableEntity for INACTIVE product', async () => {
    productsRepo.findById.mockResolvedValue({ ...activeProduct, status: 'INACTIVE' })

    await expect(
      service.create({
        customerName: 'A',
        customerPhone: '0912345678',
        customerAddress: 'HCM',
        paymentProofUrl: 'https://example.com',
        items: [{ productId: 'p-1', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('create: throws UnprocessableEntity for missing product', async () => {
    productsRepo.findById.mockResolvedValue(null)

    await expect(
      service.create({
        customerName: 'A',
        customerPhone: '0912345678',
        customerAddress: 'HCM',
        paymentProofUrl: 'https://example.com',
        items: [{ productId: 'bad', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('findOne: throws NotFoundException when order missing', async () => {
    ordersRepo.findById.mockResolvedValue(null)
    await expect(service.findOne('bad')).rejects.toBeInstanceOf(NotFoundException)
  })

  describe('isAllowedOrderTransition', () => {
    it.each([
      ['PENDING_PAYMENT_REVIEW', 'CONFIRMED'],
      ['PENDING_PAYMENT_REVIEW', 'REJECTED'],
      ['PENDING_PAYMENT_REVIEW', 'CANCELLED'],
      ['CONFIRMED', 'DELIVERED'],
      ['CONFIRMED', 'CANCELLED'],
    ] as const)('%s → %s is allowed', (from, to) => {
      expect(isAllowedOrderTransition(from, to)).toBe(true)
    })

    it.each([
      ['PENDING_PAYMENT_REVIEW', 'DELIVERED'],
      ['CONFIRMED', 'REJECTED'],
      ['REJECTED', 'CONFIRMED'],
      ['REJECTED', 'DELIVERED'],
      ['DELIVERED', 'CANCELLED'],
      ['CANCELLED', 'CONFIRMED'],
    ] as const)('%s → %s is NOT allowed', (from, to) => {
      expect(isAllowedOrderTransition(from, to)).toBe(false)
    })

    it('same status returns true for non-terminal', () => {
      expect(isAllowedOrderTransition('PENDING_PAYMENT_REVIEW', 'PENDING_PAYMENT_REVIEW')).toBe(
        true,
      )
    })
  })

  describe('updateStatus', () => {
    it('updates when transition is valid', async () => {
      const order = { ...baseOrder, status: 'PENDING_PAYMENT_REVIEW' as const }
      ordersRepo.findById.mockResolvedValue(order)
      ordersRepo.updateStatus.mockResolvedValue({ ...order, status: 'CONFIRMED' })

      const result = await service.updateStatus('o-1', 'CONFIRMED')
      expect(result.status).toBe('CONFIRMED')
      expect(ordersRepo.updateStatus).toHaveBeenCalledWith('o-1', 'CONFIRMED')
    })

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepo.findById.mockResolvedValue(null)
      await expect(service.updateStatus('bad', 'CONFIRMED')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it('throws UnprocessableEntityException on invalid transition', async () => {
      const order = { ...baseOrder, status: 'REJECTED' as const }
      ordersRepo.findById.mockResolvedValue(order)
      await expect(service.updateStatus('o-1', 'CONFIRMED')).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      )
    })
  })
})
