import { Test } from '@nestjs/testing'
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { CacheService } from '../../common/cache'
import { CampaignsService } from './campaigns.service'
import { CAMPAIGNS_REPOSITORY, CampaignsRepository } from './campaigns.repository'

const campaign = {
  id: 'c-1',
  title: 'Polo Fundraiser',
  description: null,
  coverImageUrl: null,
  goalCents: 1000000,
  startDate: new Date('2026-06-01T00:00:00Z'),
  endDate: new Date('2026-07-01T00:00:00Z'),
  status: 'ACTIVE' as const,
  createdAt: new Date('2026-05-01T00:00:00Z'),
  updatedAt: new Date('2026-05-01T00:00:00Z'),
}

describe('CampaignsService', () => {
  let service: CampaignsService
  let repo: jest.Mocked<CampaignsRepository>
  let cache: { getOrSet: jest.Mock; invalidate: jest.Mock; invalidateByPrefix: jest.Mock }

  beforeEach(async () => {
    repo = {
      list: jest.fn(),
      listActive: jest.fn().mockResolvedValue([campaign]),
      findById: jest.fn().mockResolvedValue(campaign),
      create: jest.fn().mockResolvedValue(campaign),
      update: jest.fn().mockResolvedValue(campaign),
      getProgress: jest.fn().mockResolvedValue({ raisedCents: 250000, orderCount: 3 }),
      getProgressMany: jest
        .fn()
        .mockResolvedValue(new Map([['c-1', { raisedCents: 250000, orderCount: 3 }]])),
      listTransactions: jest.fn().mockResolvedValue({
        total: 1,
        items: [
          {
            id: 'o-1',
            customerName: 'Buyer',
            status: 'CONFIRMED',
            campaignId: 'c-1',
            totalCents: 250000,
            itemCount: 2,
            createdAt: new Date('2026-06-05T00:00:00Z'),
          },
        ],
      }),
    } as unknown as jest.Mocked<CampaignsRepository>

    cache = {
      getOrSet: jest.fn(async (_key: string, factory: () => Promise<unknown>) => factory()),
      invalidate: jest.fn().mockResolvedValue(1),
      invalidateByPrefix: jest.fn().mockResolvedValue(1),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: CAMPAIGNS_REPOSITORY, useValue: repo },
        { provide: CacheService, useValue: cache },
      ],
    }).compile()

    service = moduleRef.get(CampaignsService)
  })

  it('computes progress percent capped at 100', async () => {
    repo.getProgressMany.mockResolvedValue(
      new Map([['c-1', { raisedCents: 1500000, orderCount: 9 }]]),
    )
    const list = await service.listPublic()
    expect(list[0].progress.percent).toBe(100)
    expect(list[0].progress.raisedCents).toBe(1500000)
  })

  it('returns progress percent for partial funding', async () => {
    const detail = await service.getPublic('c-1')
    expect(detail.progress.percent).toBe(25)
  })

  it('hides non-active campaign from public detail', async () => {
    repo.findById.mockResolvedValue({ ...campaign, status: 'DRAFT' })
    await expect(service.getPublic('c-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('rejects create when endDate precedes startDate', async () => {
    await expect(
      service.create({
        title: 'Bad',
        goalCents: 100,
        startDate: '2026-07-01',
        endDate: '2026-06-01',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('invalidates cache after create', async () => {
    await service.create({
      title: 'New',
      goalCents: 100,
      startDate: '2026-06-01',
      endDate: '2026-07-01',
    })
    expect(cache.invalidateByPrefix).toHaveBeenCalledWith('cache:campaigns:public:')
  })

  it('rejects invalid transaction status filter', async () => {
    await expect(
      service.listTransactions({ page: 1, pageSize: 20, status: 'NOPE' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })
})
