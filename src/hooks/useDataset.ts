import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Dataset, TeamInput } from '../types.ts'
import { appendHistory, getInitialDataset, loadHistory, saveDataset, saveHistory, saveKineticsCache } from '../utils/storage.ts'
import { buildDailyKinetics } from '../utils/kinetics.ts'
import { DEFAULT_CONSTANTS } from '../utils/constants.ts'

export const useDataset = () => {
  const [dataset, setDataset] = useState<Dataset>(getInitialDataset)
  const [history, setHistory] = useState(() => loadHistory())

  useEffect(() => {
    saveDataset(dataset)
  }, [dataset])

  const updateTeams = (teams: TeamInput[]) => {
    setDataset((current) => ({
      ...current,
      teams,
    }))
  }

  const updateConstants = (constants: Dataset['constants']) => {
    setDataset((current) => ({
      ...current,
      constants,
    }))
  }

  const resetConstants = () => {
    setDataset((current) => ({
      ...current,
      constants: DEFAULT_CONSTANTS,
    }))
  }

  const updateAsOf = (timestamp: string) => {
    setDataset((current) => ({
      ...current,
      asOf: timestamp,
    }))
  }

  const saveSnapshot = () => {
    const entry = appendHistory(dataset)
    setHistory(entry)
    const kinetics = buildDailyKinetics(entry, dataset.constants)
    saveKineticsCache(kinetics)
  }

  const lastUpdated = useMemo(() => dayjs(dataset.asOf).format('YYYY-MM-DD HH:mm'), [dataset.asOf])

  useEffect(() => {
    saveHistory(history)
  }, [history])

  return {
    dataset,
    setDataset,
    history,
    updateTeams,
    updateConstants,
    resetConstants,
    updateAsOf,
    saveSnapshot,
    lastUpdated,
  }
}

