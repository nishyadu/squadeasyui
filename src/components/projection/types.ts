import type { Dayjs } from 'dayjs'

import type { DatasetConstants, TeamWithKPIs, HistoryEntry } from '../../types.ts'

export type PaceBracket = 'slow' | 'moderate' | 'fast'

export type SeriesPoint = {
  date: Dayjs
  points: number
  estimated: boolean
}

export type TeamProjection = {
  name: string
  color: string
  current: number
  pacePerDay: number
  daysRemaining: number
  projected: number
  deltaToLeader: number
  rank: number
  usedEstimates: boolean
  insufficientData: boolean
  paceBracket: PaceBracket
  history: SeriesPoint[]
  projection: SeriesPoint[]
  team: TeamWithKPIs
}

export type ProjectionInputs = {
  datasetAsOf: string
  history: HistoryEntry[]
  teams: TeamWithKPIs[]
  lookbackDays: number
  endDate: string
  constants: DatasetConstants
}

