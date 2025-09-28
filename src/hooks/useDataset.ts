import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Dataset, TeamInput } from '../types.ts'
import { HISTORY_LIMIT } from '../utils/constants.ts'
import { loadDataset, loadHistory, loadKinetics, saveDataset, saveKinetics, saveSnapshot as persistSnapshot, updateConstants as persistConstants } from '../utils/database.ts'

type UseDatasetState = {
  dataset: Dataset
  history: Awaited<ReturnType<typeof loadHistory>>
  kinetics: Awaited<ReturnType<typeof loadKinetics>>
  loading: boolean
  error: string | null
}

const defaultState: UseDatasetState = {
  dataset: {
    asOf: dayjs().toISOString(),
    constants: {
      stepsPerKmFoot: 1350,
      ptsPerKmRunWalk: 14,
      ptsPerKmBike: 7,
      ptsPer10kStepsBaseline: 60,
      stepMissionPts: {
        fiveK: 50,
        eightK: 30,
        tenK: 30,
      },
    },
    teams: [],
  },
  history: [],
  kinetics: [],
  loading: true,
  error: null,
}

export const useDataset = () => {
  const [state, setState] = useState<UseDatasetState>(defaultState)

  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      try {
        const [dataset, history, kinetics] = await Promise.all([loadDataset(), loadHistory(), loadKinetics()])
        if (!cancelled) {
          setState({ dataset, history, kinetics, loading: false, error: null })
        }
      } catch (error) {
        console.error('Failed to load dataset', error)
        if (!cancelled) {
          setState((previous) => ({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Unknown error' }))
        }
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const setDataset = useCallback((updater: Dataset | ((current: Dataset) => Dataset)) => {
    setState((previous) => {
      const nextDataset = typeof updater === 'function' ? (updater as (current: Dataset) => Dataset)(previous.dataset) : updater
      void saveDataset(nextDataset).catch((error) => {
        console.error('Failed to persist dataset', error)
      })
      return { ...previous, dataset: nextDataset }
    })
  }, [])

  const updateTeams = useCallback((teams: TeamInput[]) => {
    setDataset((current) => ({
      ...current,
      teams,
    }))
  }, [setDataset])

  const updateConstants = useCallback((constants: Dataset['constants']) => {
    setDataset((current) => ({
      ...current,
      constants,
    }))
    void persistConstants({ ...state.dataset, constants }, {}).catch((error) => {
      console.error('Failed to update constants', error)
    })
  }, [setDataset, state.dataset])

  const resetConstants = useCallback(() => {
    setDataset((current) => ({
      ...current,
      constants: defaultState.dataset.constants,
    }))
  }, [setDataset])

  const updateAsOf = useCallback((timestamp: string) => {
    setDataset((current) => ({
      ...current,
      asOf: timestamp,
    }))
  }, [setDataset])

  const saveSnapshot = useCallback(async () => {
    try {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      const { history, kinetics } = await persistSnapshot(state.dataset, HISTORY_LIMIT)
      setState((previous) => ({ ...previous, history, kinetics, loading: false }))
      await saveKinetics(kinetics)
    } catch (error) {
      console.error('Failed to save snapshot', error)
      setState((previous) => ({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Failed to save snapshot' }))
    }
  }, [state.dataset])

  const lastUpdated = useMemo(() => dayjs(state.dataset.asOf).format('YYYY-MM-DD HH:mm'), [state.dataset.asOf])

  return {
    dataset: state.dataset,
    setDataset,
    history: state.history,
  kinetics: state.kinetics,
    loading: state.loading,
    error: state.error,
    updateTeams,
    updateConstants,
    resetConstants,
    updateAsOf,
    saveSnapshot,
    lastUpdated,
  }
}

