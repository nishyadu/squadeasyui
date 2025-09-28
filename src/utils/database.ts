import dayjs from 'dayjs'

import type { Dataset, DatasetConstants, HistoryEntry, TeamDailyKinetics } from '../types.ts'
import { DEFAULT_CONSTANTS } from './constants.ts'
import { buildDailyKinetics } from './kinetics.ts'
import { isSupabaseConfigured } from '../services/supabaseClient.ts'
import { fetchHistory, fetchKinetics, fetchLatestDataset, insertHistoryEntry, pruneHistory, replaceKinetics, upsertDataset } from '../services/supabaseStorage.ts'
import {
  fallbackAppendHistory,
  fallbackLoadDataset,
  fallbackLoadHistory,
  fallbackLoadKinetics,
  fallbackSaveDataset,
  fallbackSaveHistory,
  fallbackSaveKinetics,
} from './supabaseStorageFallback.ts'

export const loadDataset = async (): Promise<Dataset> => {
  if (!isSupabaseConfigured) {
    return fallbackLoadDataset() ?? {
      asOf: dayjs().toISOString(),
      constants: { ...DEFAULT_CONSTANTS },
      teams: [],
    }
  }

  const dataset = await fetchLatestDataset()
  if (dataset) return dataset

  return {
    asOf: dayjs().toISOString(),
    constants: { ...DEFAULT_CONSTANTS },
    teams: [],
  }
}

export const saveDataset = async (dataset: Dataset): Promise<void> => {
  if (!isSupabaseConfigured) {
    fallbackSaveDataset(dataset)
    return
  }
  await upsertDataset(dataset)
}

export const loadHistory = async (): Promise<HistoryEntry[]> => {
  if (!isSupabaseConfigured) {
    return fallbackLoadHistory()
  }
  return await fetchHistory()
}

export const appendHistory = async (dataset: Dataset, limit: number): Promise<HistoryEntry[]> => {
  if (!isSupabaseConfigured) {
    return fallbackAppendHistory(dataset)
  }

  const history = await fetchHistory(limit)
  const entry: HistoryEntry = {
    ...dataset,
    savedAt: dayjs().toISOString(),
  }
  const updated = [entry, ...history].slice(0, limit)
  await insertHistoryEntry(entry)
  if (updated.length === limit) {
    await pruneHistory(limit)
  }
  return updated
}

export const saveHistory = async (history: HistoryEntry[]): Promise<void> => {
  if (!isSupabaseConfigured) {
    fallbackSaveHistory(history)
  }
}

export const loadKinetics = async (): Promise<TeamDailyKinetics[]> => {
  if (!isSupabaseConfigured) {
    return fallbackLoadKinetics()
  }
  return await fetchKinetics()
}

export const saveKinetics = async (kinetics: TeamDailyKinetics[]): Promise<void> => {
  if (!isSupabaseConfigured) {
    fallbackSaveKinetics(kinetics)
    return
  }
  await replaceKinetics(kinetics)
}

export const updateConstants = async (dataset: Dataset, constants: Partial<DatasetConstants>): Promise<Dataset> => {
  const next: Dataset = {
    ...dataset,
    constants: {
      ...dataset.constants,
      ...constants,
      stepMissionPts: {
        ...dataset.constants.stepMissionPts,
        ...constants.stepMissionPts,
      },
    },
  }

  await saveDataset(next)
  return next
}

export const saveSnapshot = async (dataset: Dataset, limit: number): Promise<{ history: HistoryEntry[]; kinetics: TeamDailyKinetics[] }> => {
  const history = await appendHistory(dataset, limit)
  const kinetics = buildDailyKinetics(history, dataset.constants)
  await saveKinetics(kinetics)
  return { history, kinetics }
}

