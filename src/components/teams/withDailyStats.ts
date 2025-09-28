import dayjs from 'dayjs'

import type { Dataset, TeamKPIs, TeamWithKPIs } from '../../types.ts'

const DEFAULT_CHALLENGE_START = '2025-09-17T00:00:00Z'

export type DailyStats = {
  daysSoFar: number
  totalPoints: number
  pointsPerDay: number
  kmPerDay: number
  stepsPerDay: number
  isEstimated: boolean
}

export const withDailyStats = (team: TeamWithKPIs, kpis: TeamKPIs, dataset: Dataset): DailyStats => {
  const challengeStart = dayjs(dataset.challengeStartDate ?? DEFAULT_CHALLENGE_START)
  const asOf = dayjs(dataset.asOf)
  const daysDiff = Math.ceil(Math.max(asOf.diff(challengeStart, 'day', true), 0))
  const daysSoFar = Math.max(1, daysDiff)

  const isEstimated = team.teamPoints === undefined
  const totalPoints = Math.round(team.teamPoints ?? kpis.estPoints)
  const pointsPerDay = totalPoints / daysSoFar
  const kmPerDay = team.activityKm / daysSoFar
  const stepsPerDay = team.steps / daysSoFar

  return {
    daysSoFar,
    totalPoints,
    pointsPerDay,
    kmPerDay,
    stepsPerDay,
    isEstimated,
  }
}

