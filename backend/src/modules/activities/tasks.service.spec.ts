import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACTIVITIES_REPOSITORY, TASKS_REPOSITORY } from '../../common/repository'
import { ActivitiesRepository } from './activities.repository'
import { TasksRepository } from './tasks.repository'
import { TasksService } from './tasks.service'

const baseActivity = {
  id: 'act-1',
  title: 'Test',
  description: null,
  startTime: new Date(),
  endTime: new Date(),
  status: 'DRAFT' as const,
  createdById: 'admin-1',
  createdAt: new Date(),
}

const baseTask = {
  id: 'task-1',
  activityId: 'act-1',
  name: 'Hậu cần',
  description: null,
  slotCount: 3,
  priority: 1,
  createdAt: new Date(),
}

describe('TasksService', () => {
  let service: TasksService
  let activitiesRepo: jest.Mocked<Pick<ActivitiesRepository, 'findById'>>
  let tasksRepo: jest.Mocked<
    Pick<TasksRepository, 'findById' | 'findByActivity' | 'create' | 'update'>
  >

  beforeEach(async () => {
    activitiesRepo = { findById: jest.fn() }
    tasksRepo = {
      findById: jest.fn(),
      findByActivity: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ACTIVITIES_REPOSITORY, useValue: activitiesRepo },
        { provide: TASKS_REPOSITORY, useValue: tasksRepo },
      ],
    }).compile()

    service = module.get(TasksService)
  })

  it('create: throws NotFoundException when activity missing', async () => {
    activitiesRepo.findById.mockResolvedValue(null)
    await expect(service.create('bad-id', { name: 'X', slotCount: 1 })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('create: creates task for existing activity', async () => {
    activitiesRepo.findById.mockResolvedValue(baseActivity as never)
    tasksRepo.create.mockResolvedValue(baseTask as never)

    const result = await service.create('act-1', { name: 'Hậu cần', slotCount: 3, priority: 1 })
    expect(result.name).toBe('Hậu cần')
    expect(tasksRepo.create).toHaveBeenCalledWith(expect.objectContaining({ activityId: 'act-1' }))
  })

  it('update: throws NotFoundException when task missing', async () => {
    tasksRepo.findById.mockResolvedValue(null)
    await expect(service.update('bad-id', { slotCount: 5 })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('update: updates task fields', async () => {
    tasksRepo.findById.mockResolvedValue(baseTask as never)
    tasksRepo.update.mockResolvedValue({ ...baseTask, slotCount: 5 } as never)

    const result = await service.update('task-1', { slotCount: 5 })
    expect(result.slotCount).toBe(5)
  })
})
