import { ConflictException, UnprocessableEntityException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { LockService } from '../../common/lock'
import { AssignmentsRepository } from './assignments.repository'
import { ASSIGNMENTS_REPOSITORY, MatchingService } from './matching.service'

const baseAssignment = {
  id: 'assign-1',
  activityId: 'activity-1',
  taskId: 'task-1',
  userId: 'user-1',
  source: 'MATCHER' as const,
  status: 'PROPOSED' as const,
  createdAt: new Date(),
}

describe('MatchingService overrideAssignment', () => {
  let service: MatchingService
  let tasks: { findById: jest.Mock; findByActivity: jest.Mock }
  let assignments: jest.Mocked<
    Pick<
      AssignmentsRepository,
      | 'findById'
      | 'findByActivity'
      | 'findByActivityAndUser'
      | 'countByTask'
      | 'findUserConflict'
      | 'createMany'
      | 'deleteByActivity'
      | 'updateManual'
    >
  >

  beforeEach(async () => {
    tasks = { findById: jest.fn(), findByActivity: jest.fn() }
    assignments = {
      findById: jest.fn(),
      findByActivity: jest.fn(),
      findByActivityAndUser: jest.fn(),
      countByTask: jest.fn(),
      findUserConflict: jest.fn(),
      createMany: jest.fn(),
      deleteByActivity: jest.fn(),
      updateManual: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: ACTIVITIES_REPOSITORY, useValue: { findById: jest.fn(), update: jest.fn() } },
        { provide: TASKS_REPOSITORY, useValue: tasks },
        { provide: REGISTRATIONS_REPOSITORY, useValue: { findByActivity: jest.fn() } },
        { provide: ASSIGNMENTS_REPOSITORY, useValue: assignments },
        {
          provide: LockService,
          useValue: {
            withLock: jest.fn((_resource, _ttl, fn) => fn()),
          },
        },
      ],
    }).compile()

    service = module.get(MatchingService)
  })

  it('overrides task and sets source MANUAL', async () => {
    assignments.findById.mockResolvedValue(baseAssignment)
    tasks.findById.mockResolvedValue({ id: 'task-2', activityId: 'activity-1', slotCount: 2 })
    assignments.countByTask.mockResolvedValue(1)
    assignments.updateManual.mockResolvedValue({
      ...baseAssignment,
      taskId: 'task-2',
      source: 'MANUAL',
    })

    const result = await service.overrideAssignment('assign-1', { taskId: 'task-2' })

    expect(result.source).toBe('MANUAL')
    expect(assignments.updateManual).toHaveBeenCalledWith(
      'assign-1',
      expect.objectContaining({ taskId: 'task-2', userId: 'user-1' }),
    )
  })

  it('throws 422 when target task is full', async () => {
    assignments.findById.mockResolvedValue(baseAssignment)
    tasks.findById.mockResolvedValue({ id: 'task-2', activityId: 'activity-1', slotCount: 1 })
    assignments.countByTask.mockResolvedValue(1)

    await expect(
      service.overrideAssignment('assign-1', { taskId: 'task-2' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('throws 409 when target user already has assignment in activity', async () => {
    assignments.findById.mockResolvedValue(baseAssignment)
    assignments.findUserConflict.mockResolvedValue({ ...baseAssignment, id: 'assign-2' })

    await expect(
      service.overrideAssignment('assign-1', { userId: 'user-2' }),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
