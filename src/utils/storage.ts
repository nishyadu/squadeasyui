import dayjs from 'dayjs'
import type { Dataset, DatasetConstants, HistoryEntry, TeamDailyKinetics } from '../types.ts'
import { DEFAULT_CONSTANTS, HISTORY_LIMIT, STORAGE_KEYS } from './constants.ts'

const isBrowser = typeof window !== 'undefined'

const getLocalStorage = (): Storage | undefined => {
  if (!isBrowser) return undefined
  try {
    return window.localStorage
  } catch (error) {
    console.error('LocalStorage unavailable', error)
    return undefined
  }
}

export const loadDataset = (): Dataset | undefined => {
  const storage = getLocalStorage()
  if (!storage) return undefined

  const raw = storage.getItem(STORAGE_KEYS.dataset)
  if (!raw) return undefined

  try {
    const parsed = JSON.parse(raw) as Dataset
    if (!parsed.constants) {
      parsed.constants = { ...DEFAULT_CONSTANTS }
    }
    return parsed
  } catch (error) {
    console.error('Failed to parse dataset', error)
    return undefined
  }
}

export const saveDataset = (dataset: Dataset): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.dataset, JSON.stringify(dataset))
  } catch (error) {
    console.error('Failed to save dataset', error)
  }
}

export const loadHistory = (): HistoryEntry[] => {
  const storage = getLocalStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(STORAGE_KEYS.history)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return parsed
  } catch (error) {
    console.error('Failed to parse history', error)
    return []
  }
}

export const loadKineticsCache = (): TeamDailyKinetics[] => {
  const storage = getLocalStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(STORAGE_KEYS.kinetics)
    if (!raw) return []
    return JSON.parse(raw) as TeamDailyKinetics[]
  } catch (error) {
    console.error('Failed to parse kinetics cache', error)
    return []
  }
}

export const saveKineticsCache = (kinetics: TeamDailyKinetics[]): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.kinetics, JSON.stringify(kinetics))
  } catch (error) {
    console.error('Failed to save kinetics cache', error)
  }
}

export const saveHistory = (history: HistoryEntry[]): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.history, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history', error)
  }
}

export const appendHistory = (dataset: Dataset): HistoryEntry[] => {
  const history = loadHistory()
  const entry: HistoryEntry = {
    ...dataset,
    savedAt: dayjs().toISOString(),
  }
  const updated = [entry, ...history].slice(0, HISTORY_LIMIT)
  saveHistory(updated)
  return updated
}

export const getInitialDataset = (): Dataset => {
  const persisted = loadDataset()
  if (persisted) return persisted

  return {
    asOf: dayjs().toISOString(),
    constants: { ...DEFAULT_CONSTANTS },
    teams: [],
  }
}

export const updateConstants = (dataset: Dataset, constants: Partial<DatasetConstants>): Dataset => {
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
  saveDataset(next)
  return next
}

