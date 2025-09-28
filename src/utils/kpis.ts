import type { DatasetConstants, TeamInput, TeamKPIs } from '../types.ts'
import { clamp, safeDivide } from './number.ts'

const CV_THRESHOLD = 1e-6

type StepsContext = {
  footKmEstimate: number
  bikeKmEstimate: number
}

const computeEstPoints = (
  team: TeamInput,
  constants: DatasetConstants,
  context: StepsContext,
): number => {
  const stepsFactor = safeDivide(team.steps, 10_000)
  const pointsFromSteps = constants.ptsPer10kStepsBaseline * stepsFactor
  const pointsFromRunWalk = constants.ptsPerKmRunWalk * Math.min(team.activityKm, context.footKmEstimate)
  const pointsFromBike = constants.ptsPerKmBike * context.bikeKmEstimate
  const missionsPer100k = safeDivide(team.missions, safeDivide(team.steps, 100_000))
  const missionBundleMax = constants.stepMissionPts.fiveK + constants.stepMissionPts.eightK + constants.stepMissionPts.tenK
  const pointsFromMissions = missionsPer100k * safeDivide(team.steps, 100_000) * missionBundleMax

  return pointsFromSteps + pointsFromRunWalk + pointsFromBike + pointsFromMissions
}

const computeBalanceCV = (team: TeamInput): number | undefined => {
  if (!team.members || team.members.length === 0) {
    return undefined
  }

  const points = team.members.map((member) => member.points).filter((value) => Number.isFinite(value))
  if (points.length === 0) {
    return undefined
  }

  const mean = points.reduce((acc, value) => acc + value, 0) / points.length
  if (Math.abs(mean) < CV_THRESHOLD) {
    return undefined
  }

  const variance = points.reduce((acc, value) => acc + (value - mean) ** 2, 0) / points.length
  const stddev = Math.sqrt(variance)

  return stddev / mean
}

const computeBoostCoverage = (team: TeamInput): number | undefined => {
  if (!team.members || team.members.length === 0 || team.boostActiveCount === undefined) {
    return undefined
  }

  return clamp(team.boostActiveCount / team.members.length, 0, 1)
}

export const computeKPIs = (team: TeamInput, constants: DatasetConstants): TeamKPIs => {
  const notes: string[] = []

  const stepsPerKm = team.activityKm === 0 ? Number.POSITIVE_INFINITY : safeDivide(team.steps, team.activityKm)

  const kmPer10kSteps = team.steps === 0 ? 0 : safeDivide(team.activityKm, safeDivide(team.steps, 10_000))

  const footKmEstimate = safeDivide(team.steps, constants.stepsPerKmFoot)
  const loggingRate = clamp(team.activityKm === 0 ? 0 : safeDivide(team.activityKm, footKmEstimate), 0, 1)

  const bikeKmEstimate = Math.max(0, team.activityKm - footKmEstimate)
  const bikeShare = team.activityKm > 0 ? clamp(safeDivide(bikeKmEstimate, team.activityKm), 0, 1) : 0

  const missionsPer100k = team.steps === 0 ? 0 : safeDivide(team.missions, safeDivide(team.steps, 100_000))
  const quizPer100k = team.steps === 0 ? 0 : safeDivide(team.quizzes, safeDivide(team.steps, 100_000))
  const photoPer100k = team.steps === 0 ? 0 : safeDivide(team.photos, safeDivide(team.steps, 100_000))

  const context: StepsContext = {
    footKmEstimate,
    bikeKmEstimate,
  }

  const estPoints = computeEstPoints(team, constants, context)

  const stepsFactor = safeDivide(team.steps, 10_000)
  const pointsForYield = team.teamPoints ?? estPoints
  const ptsPer10kSteps = stepsFactor === 0 ? 0 : safeDivide(pointsForYield, stepsFactor)
  const ptsPerKm = team.activityKm === 0 ? 0 : safeDivide(pointsForYield, team.activityKm)

  if (!Number.isFinite(stepsPerKm)) {
    notes.push('Activity km is zero, steps per km set to Infinity')
  }

  if (team.steps === 0) {
    notes.push('Step count is zero—check data quality')
  }

  const balanceCV = computeBalanceCV(team)
  const boostCoverage = computeBoostCoverage(team)

  return {
    stepsPerKm,
    kmPer10kSteps,
    loggingRate,
    bikeShare,
    missionsPer100k,
    ptsPer10kSteps,
    ptsPerKm,
    quizPer100k,
    photoPer100k,
    balanceCV,
    boostCoverage,
    estPoints,
    notes,
  }
}

