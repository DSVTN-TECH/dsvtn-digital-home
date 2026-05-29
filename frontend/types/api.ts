// ─── Enums ────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MEMBER' | 'LOGISTIC'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type ActivityStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'MATCHED' | 'COMPLETED'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type OrderStatus =
  | 'PENDING_PAYMENT_REVIEW'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'DELIVERED'
  | 'CANCELLED'

// ─── Auth ─────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

// ─── Users ────────────────────────────────────────────────────

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  fairnessScore: number
  createdAt: string
}

export interface CreateUserResponse extends User {
  temporaryPassword: string
}

// ─── Activities ───────────────────────────────────────────────

export interface Activity {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: ActivityStatus
  createdAt: string
}

export interface Task {
  id: string
  activityId: string
  name: string
  description: string | null
  slotCount: number
  priority: number
}

// ─── Orders ───────────────────────────────────────────────────

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentProofUrl: string
  status: OrderStatus
  createdAt: string
}

// ─── Generic API error ────────────────────────────────────────

export interface ApiErrorBody {
  statusCode: number
  message: string
  error?: string
}
