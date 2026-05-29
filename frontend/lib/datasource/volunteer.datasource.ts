export interface VolunteerSubmitInput {
  fullName: string
  email: string
  phone: string
  studentId: string
  note?: string
}

export interface VolunteerSubmitResult {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export interface VolunteerDataSource {
  submit(input: VolunteerSubmitInput): Promise<VolunteerSubmitResult>
}
