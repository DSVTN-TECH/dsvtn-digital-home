import type { Activity } from '@/types/api'

export const mockActivities: Activity[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Hỗ trợ tổ chức Hội Trại Mùa Xuân',
    description: 'Chuẩn bị hậu cần và đón tiếp đại biểu.',
    startTime: '2026-03-15T07:00:00.000Z',
    endTime: '2026-03-15T17:00:00.000Z',
    status: 'OPEN',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Chiến dịch hiến máu tình nguyện',
    description: 'Tiếp nhận đăng ký, hướng dẫn quy trình.',
    startTime: '2026-04-05T08:00:00.000Z',
    endTime: '2026-04-05T16:00:00.000Z',
    status: 'DRAFT',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
]
