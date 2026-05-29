import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { VOLUNTEER_APPLICATIONS_REPOSITORY } from '../../common/repository'
import { VolunteerApplicationsRepository } from './volunteer-applications.repository'
import { VolunteerApplicationsService } from './volunteer-applications.service'

const baseApp = {
  id: 'app-1',
  fullName: 'Trần Thị C',
  email: 'c@example.com',
  phone: '0912345678',
  studentId: 'SV001',
  note: null,
  status: 'PENDING' as const,
  emailStatus: 'NOT_CONFIGURED' as const,
  reviewedById: null,
  reviewedAt: null,
  createdAt: new Date(),
}

describe('VolunteerApplicationsService', () => {
  let service: VolunteerApplicationsService
  let repo: jest.Mocked<
    Pick<
      VolunteerApplicationsRepository,
      | 'create'
      | 'findById'
      | 'findMany'
      | 'findByStatus'
      | 'update'
      | 'updateEmailStatus'
      | 'delete'
    >
  >
  let emailProvider: jest.Mocked<EmailProvider>

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findByStatus: jest.fn(),
      update: jest.fn(),
      updateEmailStatus: jest.fn(),
      delete: jest.fn(),
    }
    emailProvider = { sendConfirmation: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        VolunteerApplicationsService,
        { provide: VOLUNTEER_APPLICATIONS_REPOSITORY, useValue: repo },
        { provide: EMAIL_PROVIDER, useValue: emailProvider },
      ],
    }).compile()

    service = module.get(VolunteerApplicationsService)
  })

  it('submit: creates application and returns id/status/createdAt', async () => {
    repo.create.mockResolvedValue(baseApp)

    const result = await service.submit({
      fullName: baseApp.fullName,
      email: baseApp.email,
      phone: baseApp.phone,
      studentId: baseApp.studentId,
    })

    expect(result.id).toBe(baseApp.id)
    expect(result.status).toBe('PENDING')
    expect(result.createdAt).toBeDefined()
  })

  it('review: approves application and sets reviewedBy/At', async () => {
    const reviewed = {
      ...baseApp,
      status: 'APPROVED' as const,
      reviewedById: 'admin-1',
      reviewedAt: new Date(),
    }
    repo.findById.mockResolvedValue(baseApp)
    repo.update.mockResolvedValue(reviewed)
    emailProvider.sendConfirmation.mockResolvedValue('SENT')
    repo.updateEmailStatus.mockResolvedValue({ ...reviewed, emailStatus: 'SENT' })

    const result = await service.review('app-1', { status: 'APPROVED' }, 'admin-1')

    expect(result.status).toBe('APPROVED')
    expect(repo.update).toHaveBeenCalledWith(
      'app-1',
      expect.objectContaining({
        status: 'APPROVED',
        reviewedById: 'admin-1',
      }),
    )
    expect(repo.updateEmailStatus).toHaveBeenCalledWith('app-1', 'SENT')
  })

  it('review: email failure does not block approval', async () => {
    const reviewed = {
      ...baseApp,
      status: 'APPROVED' as const,
      reviewedById: 'admin-1',
      reviewedAt: new Date(),
    }
    repo.findById.mockResolvedValue(baseApp)
    repo.update.mockResolvedValue(reviewed)
    emailProvider.sendConfirmation.mockRejectedValue(new Error('provider down'))
    repo.updateEmailStatus.mockResolvedValue({ ...reviewed, emailStatus: 'FAILED' })

    const result = await service.review('app-1', { status: 'APPROVED' }, 'admin-1')

    expect(result.status).toBe('APPROVED')
    expect(repo.updateEmailStatus).toHaveBeenCalledWith('app-1', 'FAILED')
  })

  it('review: throws NotFoundException when application not found', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(
      service.review('nonexistent', { status: 'REJECTED' }, 'admin-1'),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('findAll: returns list filtered by status', async () => {
    repo.findByStatus.mockResolvedValue([baseApp])

    const result = await service.findAll('PENDING')

    expect(result).toHaveLength(1)
    expect(repo.findByStatus).toHaveBeenCalledWith('PENDING')
  })
})
