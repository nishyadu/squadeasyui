import dayjs from 'dayjs'
import { useMemo } from 'react'

import type { Dataset, DatasetConstants, HistoryEntry, TeamWithKPIs } from '../../types.ts'
import {
  buildProjectionIntermediate,
  computeCrossTeamAveragePace,
  computeScenario,
  ensureChronologicalHistory,
  estimateTeamPoints,
} from '../../utils/projection.ts'
import type { ScenarioInputs } from '../../utils/projection.ts'

export type ProjectionInputs = {
  dataset: Dataset
  teams: TeamWithKPIs[]
  history: HistoryEntry[]
  lookbackDays: number
  constants: DatasetConstants
  scenario: ScenarioInputs
  endDate: string
  rivalTeam?: string
}

export const useProjection = ({ dataset, teams, history, lookbackDays, constants, scenario, endDate, rivalTeam }: ProjectionInputs) => {
  return useMemo(() => {
    const chronological = ensureChronologicalHistory(dataset, history)

    const fallbackPace = computeCrossTeamAveragePace(teams, chronological, lookbackDays)
    const intermediates = teams.map((team) => buildProjectionIntermediate(team, chronological, lookbackDays, constants, fallbackPace))

    const end = dayjs(endDate)
    const now = dayjs(dataset.asOf)
    const daysRemaining = Math.max(0, Math.ceil(end.diff(now, 'day', true)))

    const results = intermediates.map((intermediate, index) => {
      const projection = computeScenario(intermediate, scenario, constants)
      const currentPoints = estimateTeamPoints(intermediate.team)
      const baseProjection = currentPoints + projection.basePace * daysRemaining
      const scenarioProjection = currentPoints + projection.scenarioPace * daysRemaining

      const rival = rivalTeam ? intermediates.find((item) => item.team.name === rivalTeam) : intermediates[0]
      const rivalProjection = rival ? estimateTeamPoints(rival.team) + projection.basePace * daysRemaining : undefined
      const rivalGap = rivalProjection !== undefined ? scenarioProjection - rivalProjection : undefined

      const historicalSeries = intermediate.samples.map((sample) => ({
        date: sample.date,
        actual: Math.round(sample.points),
        base: Math.round(sample.points),
        scenario: Math.round(sample.points),
      }))

      const projectedSeries: Array<{ date: string; base: number; scenario: number }> = []
      for (let i = 1; i <= daysRemaining; i += 1) {
        const date = now.add(i, 'day').format('YYYY-MM-DD')
        projectedSeries.push({
          date,
          base: Math.round(currentPoints + projection.basePace * i),
          scenario: Math.round(currentPoints + projection.scenarioPace * i),
        })
      }

      const historyStartDate = historicalSeries[0]?.date ?? dataset.asOf
      const historyEndDate = historicalSeries[historicalSeries.length - 1]?.date ?? dataset.asOf
      const projectionStartDate = projectedSeries[0]?.date ?? endDate

      return {
        team: intermediate.team,
        projection: {
          daysRemaining,
          currentPoints,
          baseProjection,
          scenarioProjection,
          basePace: projection.basePace,
          scenarioPace: projection.scenarioPace,
          deltaLogging: projection.deltaLogging,
          deltaBike: projection.deltaBike,
          deltaMissions: projection.deltaMissions,
          rivalGap,
        },
        color: `hsl(${(index * 50) % 360} 80% 60%)`,
        series: [...historicalSeries, ...projectedSeries],
        historyStartDate,
        historyEndDate,
        projectionStartDate,
        historyCount: historicalSeries.length,
      }
    })

    return {
      daysRemaining,
      results,
    }
  }, [dataset, teams, history, lookbackDays, constants, scenario, endDate, rivalTeam])
}

