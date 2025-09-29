import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseClient: SupabaseClient | null =
  typeof supabaseUrl === 'string' && supabaseUrl.length > 0 && typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null

export const isSupabaseConfigured = supabaseClient !== null

export type SupabaseStatus =
  | { state: 'connected'; details: string }
  | { state: 'error'; details: string }
  | { state: 'checking'; details: string }

export const checkSupabaseConnection = async (): Promise<SupabaseStatus> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      state: 'error',
      details: 'Environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing.',
    }
  }

  if (!supabaseClient) {
    return {
      state: 'error',
      details: 'Supabase client could not be created with the provided environment variables.',
    }
  }

  try {
    const { error } = await supabaseClient.from('dataset').select('id').eq('id', 1).maybeSingle()
    if (error) {
      return {
        state: 'error',
        details: `Supabase query failed: ${error.message}`,
      }
    }
    return { state: 'connected', details: 'Supabase connection OK.' }
  } catch (error) {
    return {
      state: 'error',
      details: error instanceof Error ? error.message : 'Unknown Supabase connection error.',
    }
  }
}

