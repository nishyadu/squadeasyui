import dayjs from 'dayjs'

import type { Dataset, DatasetConstants, HistoryEntry, TeamInput, TeamKPIs, TeamWithKPIs } from '../types.ts'
import { computeKPIs } from './kpis.ts'

export type TeamHistorySample = {
  date: string
  daysFromStart: number
  points: number
  steps: number
  activityKm: number
  kpis: TeamKPIs
}

export const collectTeamHistory = (
  history: HistoryEntry[],
  teamName: string,
  lookbackDays: number,
): TeamHistorySample[] => {
  const sorted = [...history]
    .sort((a, b) => dayjs(a.asOf).valueOf() - dayjs(b.asOf).valueOf())
    .map((entry) => {
      const team = entry.teams.find((t) => t.name === teamName)
      if (!team) return undefined
      return { entry, team }
    })
    .filter((item): item is { entry: HistoryEntry; team: TeamInput } => Boolean(item))

  if (sorted.length === 0) return []

  const end = dayjs(sorted[sorted.length - 1].entry.asOf)
  const windowStart = end.subtract(lookbackDays, 'day')

  const windowed = sorted.filter(({ entry }) => dayjs(entry.asOf).isSame(windowStart, 'day') || dayjs(entry.asOf).isAfter(windowStart))
  const baseline = windowed[0]
  if (!baseline) return []
  const baselineDate = dayjs(baseline.entry.asOf)

  return windowed.map(({ entry, team }) => {
    const date = dayjs(entry.asOf)
    const daysFromStart = date.diff(baselineDate, 'day', true)
    const kpis = computeKPIs(team, entry.constants)
    const points = team.teamPoints ?? kpis.estPoints
    return {
      date: entry.asOf,
      daysFromStart,
      points,
      steps: team.steps,
      activityKm: team.activityKm,
      kpis,
    }
  })
}

export const computeLinearRegressionSlope = (samples: TeamHistorySample[]): number => {
  if (samples.length < 2) return 0

  const n = samples.length
  const sumX = samples.reduce((acc, sample) => acc + sample.daysFromStart, 0)
  const sumY = samples.reduce((acc, sample) => acc + sample.points, 0)
  const sumXY = samples.reduce((acc, sample) => acc + sample.daysFromStart * sample.points, 0)
  const sumXX = samples.reduce((acc, sample) => acc + sample.daysFromStart ** 2, 0)

  const denominator = n * sumXX - sumX ** 2
  if (Math.abs(denominator) < 1e-6) {
    const first = samples[0]
    const last = samples[samples.length - 1]
    const days = last.daysFromStart - first.daysFromStart
    if (days === 0) return 0
    return (last.points - first.points) / days
  }

  return (n * sumXY - sumX * sumY) / denominator
}

export const computeAverageDailyDelta = (samples: TeamHistorySample[], field: 'steps' | 'activityKm'): number => {
  if (samples.length < 2) return 0
  const first = samples[0]
  const last = samples[samples.length - 1]
  const days = Math.max(last.daysFromStart - first.daysFromStart, 1)
  return (last[field] - first[field]) / days
}

export const estimateTeamPoints = (team: TeamWithKPIs): number => team.teamPoints ?? team.kpis.estPoints

export type ScenarioInputs = {
  loggingTarget: number
  bikeShareDelta: number
  missionsTarget: number
}

export type ProjectionIntermediate = {
  team: TeamWithKPIs
  samples: TeamHistorySample[]
  basePace: number
  stepsPerDay: number
  activityKmPerDay: number
}

export const buildProjectionIntermediate = (
  team: TeamWithKPIs,
  history: HistoryEntry[],
  lookbackDays: number,
  constants: DatasetConstants,
  fallbackPace: number,
): ProjectionIntermediate => {
  const samples = collectTeamHistory(history, team.name, lookbackDays)
  const basePace = samples.length >= 2 ? computeLinearRegressionSlope(samples) : fallbackPace
  const stepsPerDay = samples.length >= 2 ? computeAverageDailyDelta(samples, 'steps') : fallbackPace * (constants.stepsPerKmFoot / constants.ptsPer10kStepsBaseline)
  const activityKmPerDay = samples.length >= 2 ? computeAverageDailyDelta(samples, 'activityKm') : stepsPerDay / Math.max(team.kpis.loggingRate, 0.01)

  return {
    team,
    samples,
    basePace,
    stepsPerDay,
    activityKmPerDay,
  }
}

export const computeCrossTeamAveragePace = (teams: TeamWithKPIs[], history: HistoryEntry[], lookbackDays: number): number => {
  const paces = teams
    .map((team) => collectTeamHistory(history, team.name, lookbackDays))
    .filter((samples) => samples.length >= 2)
    .map((samples) => computeLinearRegressionSlope(samples))

  if (paces.length === 0) {
    const estimated = teams.map((team) => estimateTeamPoints(team)).filter((value) => Number.isFinite(value))
    if (estimated.length === 0) return 0
    return estimated.reduce((acc, value) => acc + value, 0) / estimated.length
  }

  return paces.reduce((acc, value) => acc + value, 0) / paces.length
}

export type ProjectionScenario = {
  basePace: number
  scenarioPace: number
  deltaLogging: number
  deltaBike: number
  deltaMissions: number
  stepsPerDay: number
  activityKmPerDay: number
}

export const computeScenario = (
  intermediate: ProjectionIntermediate,
  scenario: ScenarioInputs,
  constants: DatasetConstants,
): ProjectionScenario => {
  const { team, basePace, stepsPerDay, activityKmPerDay } = intermediate

  const currentLogging = team.kpis.loggingRate
  const loggingTarget = Math.max(scenario.loggingTarget, currentLogging)
  const footKmPerDay = stepsPerDay / Math.max(constants.stepsPerKmFoot, 1)
  const deltaLogging = Math.max(0, (loggingTarget - currentLogging) * footKmPerDay * constants.ptsPerKmRunWalk)

  const deltaBikeShare = Math.max(0, scenario.bikeShareDelta)
  const effectiveActivity = activityKmPerDay > 0 ? activityKmPerDay : footKmPerDay / Math.max(currentLogging, 0.01)
  const extraBikeKm = effectiveActivity * deltaBikeShare
  const deltaBike = extraBikeKm * constants.ptsPerKmBike

  const currentMissions = team.kpis.missionsPer100k
  const missionsTarget = Math.max(scenario.missionsTarget, currentMissions)
  const deltaMissions = Math.max(0, missionsTarget - currentMissions)
  const stepsPerHundredK = stepsPerDay / 100_000
  const deltaMissionPoints = stepsPerHundredK * deltaMissions * 110

  const scenarioPace = basePace + deltaLogging + deltaBike + deltaMissionPoints

  return {
    basePace,
    scenarioPace,
    deltaLogging,
    deltaBike,
    deltaMissions: deltaMissionPoints,
    stepsPerDay,
    activityKmPerDay: effectiveActivity,
  }
}

export const ensureChronologicalHistory = (dataset: Dataset, history: HistoryEntry[]): HistoryEntry[] => {
  const merged = new Map<string, HistoryEntry>()
  history.forEach((entry) => merged.set(entry.asOf, entry))
  merged.set(dataset.asOf, { ...dataset, savedAt: dataset.asOf })
  return [...merged.values()].sort((a, b) => dayjs(a.asOf).valueOf() - dayjs(b.asOf).valueOf())
}

