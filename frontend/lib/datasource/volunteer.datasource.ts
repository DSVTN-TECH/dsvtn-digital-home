export interface VolunteerSubmitInput {
  fullName: string
  email: string
  phone: string
  studentId: string
  note?: string
}

export type VolunteerStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface VolunteerSubmitResult {
  id: string
  status: VolunteerStatus
  createdAt: string
}

export interface VolunteerApplication {
  id: string
  fullName: string
  email: string
  phone: string
  studentId: string
  note: string | null
  status: VolunteerStatus
  reviewedById: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface VolunteerDataSource {
  submit(input: VolunteerSubmitInput): Promise<VolunteerSubmitResult>
  list(status?: VolunteerStatus): Promise<VolunteerApplication[]>
  review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<VolunteerApplication>
}
