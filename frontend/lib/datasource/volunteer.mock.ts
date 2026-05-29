import type {
  VolunteerApplication,
  VolunteerDataSource,
  VolunteerStatus,
  VolunteerSubmitInput,
  VolunteerSubmitResult,
} from './volunteer.datasource'

let mockStore: VolunteerApplication[] = [
  {
    id: 'mock-app-1',
    fullName: 'Nguyễn Văn A',
    email: 'a@example.com',
    phone: '0901234567',
    studentId: 'SV100',
    note: 'Rảnh cuối tuần',
    status: 'PENDING',
    reviewedById: null,
    reviewedAt: null,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'mock-app-2',
    fullName: 'Trần Thị B',
    email: 'b@example.com',
    phone: '0907654321',
    studentId: 'SV101',
    note: null,
    status: 'APPROVED',
    reviewedById: 'admin-1',
    reviewedAt: '2026-05-02T00:00:00.000Z',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
]

export class MockVolunteerDataSource implements VolunteerDataSource {
  async submit(input: VolunteerSubmitInput): Promise<VolunteerSubmitResult> {
    const app: VolunteerApplication = {
      id: `mock-${Date.now()}`,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      studentId: input.studentId,
      note: input.note ?? null,
      status: 'PENDING',
      reviewedById: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    }
    mockStore = [app, ...mockStore]
    return { id: app.id, status: app.status, createdAt: app.createdAt }
  }

  async list(status?: VolunteerStatus): Promise<VolunteerApplication[]> {
    return Promise.resolve(status ? mockStore.filter((a) => a.status === status) : [...mockStore])
  }

  async review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<VolunteerApplication> {
    const app = mockStore.find((a) => a.id === id)
    if (!app) throw new Error('Application not found')
    app.status = status
    app.reviewedById = 'mock-admin'
    app.reviewedAt = new Date().toISOString()
    return Promise.resolve({ ...app })
  }
}
