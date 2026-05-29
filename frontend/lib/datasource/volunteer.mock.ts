import type {
  VolunteerDataSource,
  VolunteerSubmitInput,
  VolunteerSubmitResult,
} from './volunteer.datasource'

export class MockVolunteerDataSource implements VolunteerDataSource {
  async submit(input: VolunteerSubmitInput): Promise<VolunteerSubmitResult> {
    void input
    return Promise.resolve({
      id: `mock-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    })
  }
}
