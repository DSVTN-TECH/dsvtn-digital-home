import { apiFetch } from '@/lib/api'
import type {
  VolunteerApplication,
  VolunteerDataSource,
  VolunteerStatus,
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

  async list(status?: VolunteerStatus): Promise<VolunteerApplication[]> {
    const query = status ? `?status=${status}` : ''
    return apiFetch<VolunteerApplication[]>(`/admin/volunteer-applications${query}`)
  }

  async review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<VolunteerApplication> {
    return apiFetch<VolunteerApplication>(`/admin/volunteer-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }
}
