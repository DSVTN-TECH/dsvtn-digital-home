import { apiFetch } from '@/lib/api'
import type {
  VolunteerDataSource,
  VolunteerSubmitInput,
  VolunteerSubmitResult,
} from './volunteer.datasource'

export class ApiVolunteerDataSource implements VolunteerDataSource {
  async submit(input: VolunteerSubmitInput): Promise<VolunteerSubmitResult> {
    return apiFetch<VolunteerSubmitResult>('/public/volunteer-applications', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }
}
