import type { Dataset, HistoryEntry, TeamDailyKinetics } from '../types.ts'
import { supabaseClient } from './supabaseClient.ts'

type SupabaseHistoryRow = {
  id: number
}

const DATASET_ID = 1

const getClientOrThrow = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured')
  }
  return supabaseClient
}

export const fetchLatestDataset = async (): Promise<Dataset | undefined> => {
  const client = getClientOrThrow()
  const { data, error } = await client.from('dataset').select('payload').eq('id', DATASET_ID).maybeSingle()
  if (error) throw error
  return data?.payload as Dataset | undefined
}

export const upsertDataset = async (dataset: Dataset): Promise<void> => {
  const client = getClientOrThrow()
  const { error } = await client
    .from('dataset')
    .upsert({ id: DATASET_ID, payload: dataset, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw error
}

export const fetchHistory = async (limit?: number): Promise<HistoryEntry[]> => {
  const client = getClientOrThrow()
  const query = client.from('history').select('snapshot').eq('dataset_id', DATASET_ID).order('created_at', { ascending: false })
  const { data, error } = await (limit ? query.limit(limit) : query)
  if (error) throw error
  return (data ?? []).map((row) => row.snapshot as HistoryEntry)
}

export const insertHistoryEntry = async (entry: HistoryEntry): Promise<void> => {
  const client = getClientOrThrow()
  const { error } = await client.from('history').insert({ dataset_id: DATASET_ID, snapshot: entry })
  if (error) throw error
}

export const pruneHistory = async (preserveLatest: number): Promise<void> => {
  const client = getClientOrThrow()
  const { data, error } = await client
    .from('history')
    .select('id')
    .eq('dataset_id', DATASET_ID)
    .order('created_at', { ascending: false })
    .range(preserveLatest, preserveLatest + 499)
  if (error) throw error
  if (!data || data.length === 0) return
  const ids = data.map((row: SupabaseHistoryRow) => row.id)
  const { error: deleteError } = await client.from('history').delete().in('id', ids)
  if (deleteError) throw deleteError
}

export const fetchKinetics = async (): Promise<TeamDailyKinetics[]> => {
  const client = getClientOrThrow()
  const { data, error } = await client.from('kinetics').select('team_name,series').eq('dataset_id', DATASET_ID).order('team_name')
  if (error) throw error
  return (data ?? []).map((row) => ({ name: row.team_name, series: row.series as TeamDailyKinetics['series'] }))
}

export const replaceKinetics = async (kinetics: TeamDailyKinetics[]): Promise<void> => {
  const client = getClientOrThrow()
  const { error: deleteError } = await client.from('kinetics').delete().eq('dataset_id', DATASET_ID)
  if (deleteError) throw deleteError

  if (kinetics.length === 0) return

  const { error: insertError } = await client
    .from('kinetics')
    .insert(
      kinetics.map((team) => ({
        dataset_id: DATASET_ID,
        team_name: team.name,
        series: team.series,
      })),
    )
  if (insertError) throw insertError
}

