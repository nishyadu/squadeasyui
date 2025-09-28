import dayjs, { type Dayjs } from 'dayjs'

import type { Dataset, DatasetConstants, TeamInput, TeamWithKPIs, HistoryEntry } from '../../types.ts'
import { computeKPIs } from '../../utils/kpis.ts'
import type { SeriesPoint, PaceBracket } from './types.ts'

type PaceComputation = {
  pacePerDay: number
  usedEstimates: boolean
  insufficientData: boolean
}

const formatKey = (date: Dayjs) => date.format('YYYY-MM-DD')

export const ensureChronologicalHistory = (dataset: Dataset, history: HistoryEntry[]): HistoryEntry[] => {
  const merged = new Map<string, HistoryEntry>()
  history.forEach((entry) => merged.set(entry.asOf, entry))
  merged.set(dataset.asOf, {
    ...dataset,
    savedAt: dataset.asOf,
  })
  return Array.from(merged.values()).sort((a, b) => dayjs(a.asOf).valueOf() - dayjs(b.asOf).valueOf())
}

export const getTeamSeries = (history: HistoryEntry[], team: TeamWithKPIs, constants: DatasetConstants): SeriesPoint[] => {
  const pointsByDate = new Map<string, SeriesPoint>()

  history.forEach((entry) => {
    const match = entry.teams.find((item) => item.name === team.name)
    if (!match) return

    const asOf = dayjs(entry.asOf).startOf('day')
    const hasPoints = typeof match.teamPoints === 'number'

    const teamInput: TeamInput = {
      name: team.name,
      steps: match.steps ?? team.steps,
      activityKm: match.activityKm ?? team.activityKm,
      missions: match.missions ?? team.missions,
      quizzes: match.quizzes ?? team.quizzes,
      photos: match.photos ?? team.photos,
      teamPoints: match.teamPoints ?? team.teamPoints,
      members: match.members ?? team.members,
      boostActiveCount: match.boostActiveCount ?? team.boostActiveCount,
    }

    const estimateSource = computeKPIs(teamInput, entry.constants ?? constants)
    const points = hasPoints ? Math.round(match.teamPoints ?? 0) : Math.round(estimateSource.estPoints)

    const key = formatKey(asOf)
    const existing = pointsByDate.get(key)
    if (!existing || asOf.isAfter(existing.date)) {
      pointsByDate.set(key, {
        date: asOf,
        points,
        estimated: !hasPoints,
      })
    }
  })

  return Array.from(pointsByDate.values()).sort((a, b) => a.date.valueOf() - b.date.valueOf())
}

export const computePace = (series: SeriesPoint[], lookbackDays: number, asOf: Dayjs): PaceComputation => {
  if (series.length === 0) {
    return { pacePerDay: 0, usedEstimates: false, insufficientData: true }
  }

  const windowStart = asOf.subtract(lookbackDays, 'day')
  const subset = series.filter((point) => !point.date.isBefore(windowStart))

  const sample = subset.length >= 2 ? subset : []

  if (sample.length < 2) {
    if (series.length >= 2) {
      const first = series[0]
      const last = series[series.length - 1]
      const days = Math.max(last.date.diff(first.date, 'day', true), 1)
      const slope = (last.points - first.points) / days
      return {
        pacePerDay: Number.isFinite(slope) ? slope : 0,
        usedEstimates: [first, last].some((point) => point.estimated),
        insufficientData: false,
      }
    }

    return { pacePerDay: 0, usedEstimates: series.some((point) => point.estimated), insufficientData: true }
  }

  const xOrigin = sample[0].date
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  sample.forEach((point) => {
    const x = point.date.diff(xOrigin, 'day', true)
    const y = point.points
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  })

  const n = sample.length
  const denominator = n * sumXX - sumX * sumX
  let slope = 0

  if (Math.abs(denominator) > 1e-6) {
    slope = (n * sumXY - sumX * sumY) / denominator
  } else {
    const first = sample[0]
    const last = sample[sample.length - 1]
    const days = Math.max(last.date.diff(first.date, 'day', true), 1)
    slope = (last.points - first.points) / days
  }

  if (!Number.isFinite(slope)) {
    slope = 0
  }

  return {
    pacePerDay: slope,
    usedEstimates: sample.some((point) => point.estimated),
    insufficientData: false,
  }
}

export const projectTeam = (current: number, pacePerDay: number, daysRemaining: number) => current + pacePerDay * daysRemaining

export const getPaceBracket = (pacePerDay: number): PaceBracket => {
  if (pacePerDay > 300) return 'fast'
  if (pacePerDay >= 150) return 'moderate'
  return 'slow'
}

export const buildProjectionSeries = (current: number, pacePerDay: number, asOf: Dayjs, daysRemaining: number): SeriesPoint[] =>
  Array.from({ length: Math.max(daysRemaining, 0) + 1 }).map((_, index) => ({
    date: asOf.add(index, 'day'),
    points: projectTeam(current, pacePerDay, index),
    estimated: false,
  }))


