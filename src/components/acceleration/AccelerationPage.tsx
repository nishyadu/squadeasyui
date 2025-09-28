import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

import type { TeamDailyKinetics } from '../../types.ts'
import { KineticsChart } from './KineticsChart.tsx'
import { KineticsHeatmap } from './KineticsHeatmap.tsx'
import { AccelerationSummaryTable } from './AccelerationSummaryTable.tsx'
import { ControlsPanel } from './ControlsPanel.tsx'
import { exportKineticsCSV } from '../../utils/export.ts'

const LOOKBACK_OPTIONS = [7, 14, 30] as const

dayjs.extend(isSameOrAfter)

const DEFAULT_LOOKBACK = LOOKBACK_OPTIONS[1]

const filterSeries = (series: TeamDailyKinetics['series'], days: number) => {
  if (series.length === 0) return []
  const end = dayjs(series[series.length - 1].date)
  const start = end.subtract(days - 1, 'day')
  return series.filter((point) => dayjs(point.date).isSameOrAfter(start))
}

type AccelerationPageProps = {
  kinetics: TeamDailyKinetics[]
}

export const AccelerationPage = ({ kinetics }: AccelerationPageProps) => {
  const [lookback, setLookback] = useState<(typeof LOOKBACK_OPTIONS)[number]>(DEFAULT_LOOKBACK)
  const [useEMA, setUseEMA] = useState(true)
  const [alphaVelocity, setAlphaVelocity] = useState(0.4)
  const [alphaAcceleration, setAlphaAcceleration] = useState(0.4)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const teamsToDisplay = selectedTeams.length > 0 ? kinetics.filter((team) => selectedTeams.includes(team.name)) : kinetics

  const filteredSeries = useMemo(
    () =>
      teamsToDisplay.map((team) => ({
        name: team.name,
        series: filterSeries(team.series, lookback),
      })),
    [teamsToDisplay, lookback],
  )

  const handleExportCSV = () => {
    exportKineticsCSV(filteredSeries)
  }

  return (
    <section className="flex flex-col gap-6">
      <ControlsPanel
        lookback={lookback}
        onLookbackChange={setLookback}
        useEMA={useEMA}
        onToggleEMA={setUseEMA}
        alphaVelocity={alphaVelocity}
        alphaAcceleration={alphaAcceleration}
        onAlphaVelocityChange={setAlphaVelocity}
        onAlphaAccelerationChange={setAlphaAcceleration}
        onExportCSV={handleExportCSV}
        onExportPNG={() => {}}
      />
      <KineticsChart
        teams={filteredSeries}
        useEMA={useEMA}
        alphaVelocity={alphaVelocity}
        alphaAcceleration={alphaAcceleration}
        selectedTeams={selectedTeams}
        onSelectedTeamsChange={setSelectedTeams}
      />
      <KineticsHeatmap
        teams={filteredSeries}
        onTeamSelect={(teamName) => setSelectedTeams([teamName])}
        onDateSelect={() => {}}
      />
      <AccelerationSummaryTable teams={filteredSeries} useEMA={useEMA} lookback={lookback} />
    </section>
  )
}


