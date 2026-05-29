import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACTIVITIES_REPOSITORY } from '../../common/repository'
import { ActivitiesRepository } from './activities.repository'
import { ActivitiesService, isAllowedTransition } from './activities.service'

const baseActivity = {
  id: 'act-1',
  title: 'Test Activity',
  description: null,
  startTime: new Date('2026-06-15T08:00:00Z'),
  endTime: new Date('2026-06-15T17:00:00Z'),
  status: 'DRAFT' as const,
  createdById: 'admin-1',
  createdAt: new Date(),
}

describe('ActivitiesService', () => {
  let service: ActivitiesService
  let repo: jest.Mocked<
    Pick<
      ActivitiesRepository,
      'findById' | 'findMany' | 'findByStatus' | 'create' | 'update' | 'delete'
    >
  >

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [ActivitiesService, { provide: ACTIVITIES_REPOSITORY, useValue: repo }],
    }).compile()

    service = module.get(ActivitiesService)
  })

  it('create: validates endTime > startTime', async () => {
    await expect(
      service.create(
        { title: 'X', startTime: '2026-06-15T17:00:00Z', endTime: '2026-06-15T08:00:00Z' },
        'admin-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('create: succeeds with valid data', async () => {
    repo.create.mockResolvedValue(baseActivity)

    const result = await service.create(
      { title: 'Test', startTime: '2026-06-15T08:00:00Z', endTime: '2026-06-15T17:00:00Z' },
      'admin-1',
    )

    expect(result.title).toBe('Test Activity')
    expect(repo.create).toHaveBeenCalled()
  })

  it('update: throws NotFoundException when activity missing', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(service.update('nonexistent', { title: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('update: throws UnprocessableEntity on invalid transition', async () => {
    repo.findById.mockResolvedValue(baseActivity)

    await expect(service.update('act-1', { status: 'COMPLETED' })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    )
  })

  it('update: allows valid transition DRAFT → OPEN', async () => {
    repo.findById.mockResolvedValue(baseActivity)
    repo.update.mockResolvedValue({ ...baseActivity, status: 'OPEN' })

    const result = await service.update('act-1', { status: 'OPEN' })

    expect(result.status).toBe('OPEN')
  })
})

describe('isAllowedTransition', () => {
  it.each([
    ['DRAFT', 'OPEN', true],
    ['OPEN', 'CLOSED', true],
    ['CLOSED', 'MATCHED', true],
    ['CLOSED', 'OPEN', true],
    ['MATCHED', 'COMPLETED', true],
    ['DRAFT', 'CLOSED', false],
    ['DRAFT', 'COMPLETED', false],
    ['OPEN', 'MATCHED', false],
    ['COMPLETED', 'DRAFT', false],
  ] as const)('%s → %s = %s', (from, to, expected) => {
    expect(isAllowedTransition(from, to)).toBe(expected)
  })
})
