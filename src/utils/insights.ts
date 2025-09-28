import type { DatasetConstants, TeamInput, TeamKPIs } from '../types.ts'
import { round } from './number.ts'

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`

const formatPoints = (value: number): string => `${Math.round(value)} pts`

const formatKm = (value: number): string => `${Math.round(value)} km`

type InsightContext = {
  constants: DatasetConstants
  kpis: TeamKPIs
  team: TeamInput
  footKmEstimate: number
}

const loggingInsights = ({ kpis, constants, footKmEstimate }: InsightContext): string | undefined => {
  const rate = kpis.loggingRate
  if (rate < 0.8) {
    const missingKm = (1 - rate) * footKmEstimate
    const points = missingKm * constants.ptsPerKmRunWalk
    return `You’re recording only ${formatPercent(rate)} of walking—start Active Walk/Run to reclaim ≈ ${formatPoints(points)}.`
  }
  if (rate < 0.95) {
    const missingKm = round((1 - rate) * footKmEstimate, 1)
    return `Good, but there’s ${formatKm(missingKm)} of walking not logged yet.`
  }
  return undefined
}

const bikeInsights = ({ kpis, constants }: InsightContext): string | undefined => {
  if (kpis.bikeShare < 0.05) {
    return `No bike split detected. Adding 20–25% bike lifts km/10k steps to 8–10 and adds easy points (~${constants.ptsPerKmBike} pts/km).`
  }
  if (kpis.bikeShare >= 0.3) {
    return 'Strong bike pillar—keep it; it boosts distance missions and pts/10k.'
  }
  return undefined
}

const missionInsights = ({ kpis }: InsightContext): string | undefined => {
  if (kpis.missionsPer100k < 15) {
    return 'Mission density is low—ensure 5k+8k+10k missions are joined before moving.'
  }
  if (kpis.missionsPer100k >= 17) {
    return 'Mission discipline is excellent—don’t drop it.'
  }
  return undefined
}

const yieldInsights = ({ kpis }: InsightContext): string | undefined => {
  if (kpis.ptsPer10kSteps < 200) {
    return 'Overall yield per step is low. Fix logging first, then add a light bike stream.'
  }
  if (kpis.ptsPer10kSteps >= 230) {
    return 'Elite yield—maintain logging + missions.'
  }
  return undefined
}

const balanceInsights = ({ kpis, team }: InsightContext): string | undefined => {
  if (kpis.balanceCV !== undefined && kpis.balanceCV > 0.3) {
    return 'Big spread in contributions; set a daily floor (10 km activity + step missions).'
  }
  if (kpis.boostCoverage !== undefined && kpis.boostCoverage < 0.6) {
    return 'Boost coverage is low—run a rota so someone’s always boosted.'
  }
  if ((team.members?.length ?? 0) === 0 && team.boostActiveCount === undefined) {
    return 'Add member points + boosts to see balance insights.'
  }
  return undefined
}

export const generateInsights = (
  team: TeamInput,
  kpis: TeamKPIs,
  constants: DatasetConstants,
): string[] => {
  const footKmEstimate = team.steps / constants.stepsPerKmFoot
  const context: InsightContext = { team, kpis, constants, footKmEstimate }
  const insights = [
    loggingInsights(context),
    bikeInsights(context),
    missionInsights(context),
    yieldInsights(context),
    balanceInsights(context),
  ].filter((item): item is string => Boolean(item))

  return insights.slice(0, 6)
}

