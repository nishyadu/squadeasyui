import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import type { Dataset, DatasetConstants, TeamWithKPIs, HistoryEntry } from '../../types.ts'
import type { TeamProjection } from './types.ts'
import { ProjectionChart } from './ProjectionChart.tsx'
import { ProjectionTable } from './ProjectionTable.tsx'
import { ProjectionControls } from './ProjectionControls.tsx'
import { buildProjectionSeries, computePace, ensureChronologicalHistory, getPaceBracket, getTeamSeries, projectTeam } from './helpers.ts'
import { getTeamColorMap } from '../../utils/colors.ts'

type ProjectionViewProps = {
  dataset: Dataset
  teams: TeamWithKPIs[]
  history: HistoryEntry[]
  constants: DatasetConstants
}

const DEFAULT_END_DATE = '2025-10-05'

export const ProjectionView = ({ dataset, teams, history, constants }: ProjectionViewProps) => {
  const [endDate, setEndDate] = useState<string>(DEFAULT_END_DATE)
  const [lookback, setLookback] = useState<number>(7)
  const [showEstimates, setShowEstimates] = useState<boolean>(true)

  const asOf = dayjs(dataset.asOf)
  const end = dayjs(endDate)
  const daysRemaining = Math.max(0, Math.ceil(end.diff(asOf, 'day', true)))
  const minSelectableDate = asOf.format('YYYY-MM-DD')
  const challengeEnded = daysRemaining === 0

  const chronoHistory = useMemo(() => ensureChronologicalHistory(dataset, history), [dataset, history])
  const teamColors = useMemo(() => getTeamColorMap(teams.map((team) => team.name)), [teams])

  const rankedTeams = useMemo(() => {
    if (teams.length === 0) return [] as TeamProjection[]

    const base = teams.map((team, index) => {
      const series = getTeamSeries(chronoHistory, team, constants)
      const paceResult = computePace(series, lookback, asOf)
      const current = series.length > 0 ? series[series.length - 1].points : 0
      const projected = projectTeam(current, paceResult.pacePerDay, daysRemaining)
      const projectionSeries = buildProjectionSeries(current, paceResult.pacePerDay, asOf, daysRemaining)

      return {
        name: team.name,
        team,
        history: series,
        projection: projectionSeries,
        current,
        pacePerDay: paceResult.pacePerDay,
        daysRemaining,
        projected,
        deltaToLeader: 0,
        rank: 0,
        usedEstimates: paceResult.usedEstimates || series.some((point) => point.estimated),
        insufficientData: paceResult.insufficientData,
        paceBracket: getPaceBracket(paceResult.pacePerDay),
        color: teamColors.get(team.name) ?? `hsl(${(index * 47) % 360} 72% 58%)`,
      } satisfies TeamProjection
    })

    const leaderProjection = base.reduce((max, team) => Math.max(max, team.projected), 0)

    return base
      .map((team) => ({
        ...team,
        deltaToLeader: Math.max(0, leaderProjection - team.projected),
      }))
      .sort((a, b) => b.projected - a.projected)
      .map((team, idx) => ({ ...team, rank: idx + 1 }))
  }, [teams, chronoHistory, constants, lookback, asOf, daysRemaining, teamColors])

  if (teams.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
        Add at least one team to view projections.
      </section>
    )
  }

  const hasHistory = rankedTeams.some((team) => team.history.length > 0)

  return (
    <section className="flex flex-col gap-6">
      <ProjectionControls
        endDate={endDate}
        onEndDateChange={setEndDate}
        lookback={lookback}
        onLookbackChange={setLookback}
        showEstimates={showEstimates}
        onToggleEstimates={setShowEstimates}
        minDate={minSelectableDate}
        daysRemaining={daysRemaining}
      />
      {hasHistory ? (
        <ProjectionChart
          teams={rankedTeams}
          endDate={endDate}
          asOf={dataset.asOf}
          showEstimates={showEstimates}
          daysRemaining={daysRemaining}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
          Save at least two history snapshots to unlock projections.
        </div>
      )}
      <ProjectionTable teams={rankedTeams} daysRemaining={daysRemaining} showEstimates={showEstimates} challengeEnded={challengeEnded} />
    </section>
  )
}

