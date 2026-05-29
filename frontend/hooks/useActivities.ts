'use client'

import { useEffect, useState } from 'react'
import type { Activity } from '@/types/api'
import { getActivitiesDataSource } from '@/lib/datasource'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const ds = getActivitiesDataSource()
    ds.list()
      .then(setActivities)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { activities, loading, error }
}
