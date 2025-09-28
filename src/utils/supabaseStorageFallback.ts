import dayjs from 'dayjs'

import type { Dataset, HistoryEntry, TeamDailyKinetics } from '../types.ts'
import { DEFAULT_CONSTANTS, HISTORY_LIMIT } from './constants.ts'

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

const STORAGE_KEYS = {
  dataset: 'squad-analytics:data',
  history: 'squad-analytics:history',
  kinetics: 'squad-analytics:accel',
} as const

export const fallbackLoadDataset = (): Dataset | undefined => {
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

export const fallbackSaveDataset = (dataset: Dataset): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.dataset, JSON.stringify(dataset))
  } catch (error) {
    console.error('Failed to save dataset', error)
  }
}

export const fallbackLoadHistory = (): HistoryEntry[] => {
  const storage = getLocalStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(STORAGE_KEYS.history)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch (error) {
    console.error('Failed to parse history', error)
    return []
  }
}

export const fallbackSaveHistory = (history: HistoryEntry[]): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.history, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history', error)
  }
}

export const fallbackAppendHistory = (dataset: Dataset): HistoryEntry[] => {
  const history = fallbackLoadHistory()
  const entry: HistoryEntry = {
    ...dataset,
    savedAt: dayjs().toISOString(),
  }
  const updated = [entry, ...history].slice(0, HISTORY_LIMIT)
  fallbackSaveHistory(updated)
  return updated
}

export const fallbackLoadKinetics = (): TeamDailyKinetics[] => {
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

export const fallbackSaveKinetics = (kinetics: TeamDailyKinetics[]): void => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.kinetics, JSON.stringify(kinetics))
  } catch (error) {
    console.error('Failed to save kinetics cache', error)
  }
}

