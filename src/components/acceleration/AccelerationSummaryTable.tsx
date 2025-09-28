import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import type { TeamDailyKinetics } from '../../types.ts'
import { fmt1 } from '../../utils/format.ts'

type SummaryTableProps = {
  teams: Array<{ name: string; series: TeamDailyKinetics['series'] }>
  lookback: number
  useEMA: boolean
}

type SortKey = 'avgVelocity' | 'avgAcceleration' | 'maxPos' | 'maxNeg' | 'pctAccel' | 'stability'

const defaultSorters: Record<SortKey, (row: SummaryRow) => number> = {
  avgVelocity: (row) => row.avgVelocity,
  avgAcceleration: (row) => row.avgAcceleration,
  maxPos: (row) => row.maxPositive.value,
  maxNeg: (row) => row.maxNegative.value,
  pctAccel: (row) => row.percentAccelerating,
  stability: (row) => -row.velocityStdDev,
}

type SummaryRow = {
  name: string
  avgVelocity: number
  avgAcceleration: number
  maxPositive: { date: string; value: number }
  maxNegative: { date: string; value: number }
  percentAccelerating: number
  velocityStdDev: number
}

const computeRow = (team: { name: string; series: TeamDailyKinetics['series'] }, useEMA: boolean): SummaryRow => {
  const velocities = team.series.map((point) => (useEMA && point.velocityEMA !== undefined ? point.velocityEMA : point.velocity))
  const accelerations = team.series.map((point) => (useEMA && point.accelEMA !== undefined ? point.accelEMA : point.acceleration))

  const avgVelocity = velocities.reduce((sum, value) => sum + value, 0) / Math.max(velocities.length, 1)
  const avgAcceleration = accelerations.reduce((sum, value) => sum + value, 0) / Math.max(accelerations.length, 1)

  const percentAccelerating = accelerations.length === 0 ? 0 : (accelerations.filter((value) => value > 0).length / accelerations.length) * 100

  let maxPositive = { value: Number.NEGATIVE_INFINITY, date: '' }
  let maxNegative = { value: Number.POSITIVE_INFINITY, date: '' }

  team.series.forEach((point) => {
    const accel = useEMA && point.accelEMA !== undefined ? point.accelEMA : point.acceleration
    if (accel > maxPositive.value) {
      maxPositive = { value: accel, date: point.date }
    }
    if (accel < maxNegative.value) {
      maxNegative = { value: accel, date: point.date }
    }
  })

  const meanVelocity = avgVelocity
  const variance = velocities.reduce((sum, value) => sum + (value - meanVelocity) ** 2, 0) / Math.max(velocities.length, 1)
  const velocityStdDev = Math.sqrt(variance)

  return {
    name: team.name,
    avgVelocity,
    avgAcceleration,
    maxPositive,
    maxNegative,
    percentAccelerating,
    velocityStdDev,
  }
}

export const AccelerationSummaryTable = ({ teams, useEMA }: SummaryTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('avgVelocity')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => teams.map((team) => computeRow(team, useEMA)), [teams, useEMA])

  const sortedRows = useMemo(() => {
    const sorter = defaultSorters[sortKey]
    const items = [...rows].sort((a, b) => sorter(b) - sorter(a))
    return direction === 'asc' ? items.reverse() : items
  }, [rows, sortKey, direction])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setDirection('desc')
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 sm:p-5 text-sm text-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Acceleration summary</h3>
          <p className="text-xs text-slate-400">% Days accelerating: “Share of days where acceleration {'>'} 0 within the window.”</p>
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed text-left text-xs sm:text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('avgVelocity')}>
                  Avg velocity
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('avgAcceleration')}>
                  Avg acceleration
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('maxPos')}>
                  Max + accel
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('maxNeg')}>
                  Max - accel
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('pctAccel')}>
                  % days accelerating
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => toggleSort('stability')}>
                  Stability (σ velocity)
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.name} className="border-t border-white/5">
                <td className="px-3 py-2 font-semibold text-white">{row.name}</td>
                <td className="px-3 py-2 text-white">{fmt1(row.avgVelocity)}</td>
                <td className="px-3 py-2 text-white">{fmt1(row.avgAcceleration)}</td>
                <td className="px-3 py-2 text-white" title={dayjs(row.maxPositive.date).format('MMM D')}>
                  {fmt1(row.maxPositive.value)}
                </td>
                <td className="px-3 py-2 text-white" title={dayjs(row.maxNegative.date).format('MMM D')}>
                  {fmt1(row.maxNegative.value)}
                </td>
                <td className="px-3 py-2 text-white">{row.percentAccelerating.toFixed(0)}%</td>
                <td className="px-3 py-2 text-white">{fmt1(row.velocityStdDev)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


