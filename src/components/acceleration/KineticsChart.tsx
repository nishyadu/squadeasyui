import { Fragment } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from 'recharts'
import dayjs from 'dayjs'

import type { TeamDailyKinetics } from '../../types.ts'

type ChartTeam = {
  name: string
  series: TeamDailyKinetics['series']
}

type KineticsChartProps = {
  teams: ChartTeam[]
  useEMA: boolean
  alphaVelocity: number
  alphaAcceleration: number
  selectedTeams: string[]
  onSelectedTeamsChange: (teams: string[]) => void
}

const formatDate = (value: string) => dayjs(value).format('MMM D')

type TooltipPayload = {
  name?: string
  color?: string
  dataKey?: string
  payload?: TeamDailyKinetics['series'][number]
  value?: number
}

type TooltipProps = {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
}

const tooltipContent = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || payload.length === 0 || typeof label !== 'string') return null
  return (
    <div className="min-w-[220px] space-y-2 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-200">
      <div className="font-semibold text-white">{dayjs(label).format('ddd, MMM D')}</div>
      {payload.map((entry, index) => {
        if (!entry.payload) return null
        const point = entry.payload
        return (
          <div key={entry.dataKey ?? index} className="space-y-1 border-b border-white/5 pb-1 last:border-none last:pb-0">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-semibold text-white">{entry.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
              <span className="text-slate-400">Points</span>
              <span className="text-right text-white">{point.points.toLocaleString()}</span>
              <span className="text-slate-400">Velocity</span>
              <span className="text-right text-white">{point.velocity.toFixed(1)}</span>
              {point.velocityEMA !== undefined ? (
                <>
                  <span className="text-slate-400">Velocity EMA</span>
                  <span className="text-right text-white">{point.velocityEMA.toFixed(1)}</span>
                </>
              ) : null}
              <span className="text-slate-400">Acceleration</span>
              <span className="text-right text-white">{point.acceleration.toFixed(1)}</span>
              {point.accelEMA !== undefined ? (
                <>
                  <span className="text-slate-400">Accel EMA</span>
                  <span className="text-right text-white">{point.accelEMA.toFixed(1)}</span>
                </>
              ) : null}
              {point.estimated ? (
                <span className="col-span-2 inline-flex items-center justify-end gap-1 text-amber-300">
                  <span className="text-[10px]">≈</span>
                  <span>estimated</span>
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const KineticsChart = ({ teams, useEMA }: KineticsChartProps) => {
  const combined = teams
    .flatMap((team) => team.series.map((point) => ({ ...point, name: team.name })))
    .reduce<Record<string, Record<string, number | string | boolean | TeamDailyKinetics['series'][number]>>>(
      (acc, point) => {
        const key = point.date
        if (!acc[key]) acc[key] = { date: key }
        acc[key][`${point.name}-velocity`] = point.velocity
        acc[key][`${point.name}-acceleration`] = useEMA ? point.accelEMA ?? point.acceleration : point.acceleration
        acc[key][`${point.name}-raw`] = point
        return acc
      },
      {},
    )

  const data = Object.values(combined).map((entry) => ({
    date: entry.date as string,
    ...entry,
  })) as Array<{ date: string } & Record<string, number | string | boolean | TeamDailyKinetics['series'][number]>>

  data.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-white">Daily Gains & Acceleration</h3>
        <p className="text-xs text-slate-400">Daily gain (velocity): “Points gained since the previous day (pts/day).” Acceleration: “Change in daily gain vs the previous day (pts/day²). Positive = speeding up.”</p>
      </header>
      <div className="mt-4 h-96">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} minTickGap={28} />
            <YAxis yAxisId="velocity" stroke="#94a3b8" tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(0) : '')} width={64} />
            <YAxis yAxisId="acceleration" orientation="right" stroke="#c084fc" tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(0) : '')} width={64} />
            <Tooltip content={tooltipContent} />
            <Legend />
            {teams.map((team) => (
              <Fragment key={team.name}>
                <Bar yAxisId="velocity" dataKey={`${team.name}-velocity`} name={`${team.name} velocity`} fill="var(--velocity-color, #38bdf8)" radius={4} />
                <Line yAxisId="acceleration" type="monotone" dataKey={`${team.name}-acceleration`} name={`${team.name} acceleration`} strokeWidth={2} strokeDasharray="6 4" />
              </Fragment>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}


