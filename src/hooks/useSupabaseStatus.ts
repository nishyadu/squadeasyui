import { useEffect, useState } from 'react'

import { checkSupabaseConnection, type SupabaseStatus } from '../services/supabaseClient.ts'

const initialStatus: SupabaseStatus = { state: 'checking', details: 'Checking Supabase connectivity…' }

export const useSupabaseStatus = () => {
  const [status, setStatus] = useState<SupabaseStatus>(initialStatus)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const result = await checkSupabaseConnection()
      if (mounted) {
        setStatus(result)
      }
    }

    void check()

    const interval = window.setInterval(check, 60_000)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  return status
}

