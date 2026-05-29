'use client'

import { useState } from 'react'
import { getVolunteerDataSource } from '@/lib/datasource'
import type {
  VolunteerSubmitInput,
  VolunteerSubmitResult,
} from '@/lib/datasource/volunteer.datasource'

export function useVolunteerSubmit() {
  const [result, setResult] = useState<VolunteerSubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(input: VolunteerSubmitInput) {
    setError(null)
    setLoading(true)
    try {
      const ds = getVolunteerDataSource()
      const res = await ds.submit(input)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi đơn thất bại')
    } finally {
      setLoading(false)
    }
  }

  return { submit, result, error, loading }
}
