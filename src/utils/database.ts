import dayjs from 'dayjs'

import type { Dataset, DatasetConstants, HistoryEntry, TeamDailyKinetics } from '../types.ts'
import { DEFAULT_CONSTANTS } from './constants.ts'
import { buildDailyKinetics } from './kinetics.ts'
import { fetchHistory, fetchKinetics, fetchLatestDataset, insertHistoryEntry, pruneHistory, replaceKinetics, upsertDataset } from '../services/supabaseStorage.ts'

const normalizeDataset = (input?: Dataset): Dataset => {
  const base: Dataset = {
    asOf: dayjs().toISOString(),
    constants: { ...DEFAULT_CONSTANTS },
    teams: [],
  }
  if (!input) return base

  const stepMissionPts = {
    ...base.constants.stepMissionPts,
    ...(input.constants?.stepMissionPts ?? {}),
  }

  const constants: DatasetConstants = {
    ...base.constants,
    ...(input.constants ?? {}),
    stepMissionPts,
  }

  return {
    ...base,
    ...input,
    asOf: input.asOf ?? base.asOf,
    constants,
    teams: input.teams ?? [],
  }
}

export const loadDataset = async (): Promise<Dataset> => {
  const dataset = await fetchLatestDataset()
  if (dataset) return normalizeDataset(dataset)

  throw new Error('Supabase dataset not seeded yet')
}

export const saveDataset = async (dataset: Dataset): Promise<void> => {
  await upsertDataset(dataset)
}

export const loadHistory = async (): Promise<HistoryEntry[]> => {
  return await fetchHistory()
}

export const appendHistory = async (dataset: Dataset, limit: number): Promise<HistoryEntry[]> => {
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
  // This function is no longer used as fallback logic is removed.
  // If Supabase is not configured, this function will not be called.
}

export const loadKinetics = async (): Promise<TeamDailyKinetics[]> => {
  return await fetchKinetics()
}

export const saveKinetics = async (kinetics: TeamDailyKinetics[]): Promise<void> => {
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

