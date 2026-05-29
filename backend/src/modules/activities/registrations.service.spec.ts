import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { RegistrationsService } from './registrations.service'

const openActivity = {
  id: 'act-1',
  title: 'X',
  description: null,
  startTime: new Date(),
  endTime: new Date(),
  status: 'OPEN' as const,
  createdById: 'a',
  createdAt: new Date(),
}
const draftActivity = { ...openActivity, status: 'DRAFT' as const }
const task1 = {
  id: 'task-1',
  activityId: 'act-1',
  name: 'T',
  description: null,
  slotCount: 3,
  priority: 0,
  createdAt: new Date(),
}

describe('RegistrationsService', () => {
  let service: RegistrationsService
  let activitiesRepo: { findById: jest.Mock }
  let tasksRepo: { findByActivity: jest.Mock }
  let registrationsRepo: {
    findByActivityAndUser: jest.Mock
    findByActivity: jest.Mock
    create: jest.Mock
  }

  beforeEach(async () => {
    activitiesRepo = { findById: jest.fn() }
    tasksRepo = { findByActivity: jest.fn() }
    registrationsRepo = {
      findByActivityAndUser: jest.fn(),
      findByActivity: jest.fn(),
      create: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: ACTIVITIES_REPOSITORY, useValue: activitiesRepo },
        { provide: TASKS_REPOSITORY, useValue: tasksRepo },
        { provide: REGISTRATIONS_REPOSITORY, useValue: registrationsRepo },
      ],
    }).compile()
    service = module.get(RegistrationsService)
  })

  it('throws NotFoundException when activity missing', async () => {
    activitiesRepo.findById.mockResolvedValue(null)
    await expect(service.submit('bad', 'u1', { preferences: [] })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('throws UnprocessableEntity when activity not OPEN', async () => {
    activitiesRepo.findById.mockResolvedValue(draftActivity)
    await expect(service.submit('act-1', 'u1', { preferences: [] })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    )
  })

  it('throws ConflictException on duplicate registration', async () => {
    activitiesRepo.findById.mockResolvedValue(openActivity)
    registrationsRepo.findByActivityAndUser.mockResolvedValue({ id: 'existing' })
    await expect(service.submit('act-1', 'u1', { preferences: [] })).rejects.toBeInstanceOf(
      ConflictException,
    )
  })

  it('throws UnprocessableEntity when taskId not in activity', async () => {
    activitiesRepo.findById.mockResolvedValue(openActivity)
    registrationsRepo.findByActivityAndUser.mockResolvedValue(null)
    tasksRepo.findByActivity.mockResolvedValue([task1])
    await expect(
      service.submit('act-1', 'u1', { preferences: [{ taskId: 'bad-task', score: 2 }] }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('creates registration with valid preferences', async () => {
    activitiesRepo.findById.mockResolvedValue(openActivity)
    registrationsRepo.findByActivityAndUser.mockResolvedValue(null)
    tasksRepo.findByActivity.mockResolvedValue([task1])
    registrationsRepo.create.mockResolvedValue({
      id: 'reg-1',
      preferences: [{ taskId: 'task-1', score: 3 }],
    })

    const result = await service.submit('act-1', 'u1', {
      preferences: [{ taskId: 'task-1', score: 3 }],
    })
    expect(result.id).toBe('reg-1')
  })
})
