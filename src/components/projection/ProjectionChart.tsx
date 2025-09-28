import dayjs from 'dayjs'
import { Fragment } from 'react'
import { Line, LineChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { TeamProjection } from './types.ts'

type ProjectionChartProps = {
  teams: TeamProjection[]
  endDate: string
  asOf: string
  showEstimates: boolean
  daysRemaining: number
}

type CombinedPoint = {
  date: string
  [key: string]: number | string | boolean | undefined
}

const formatDateLabel = (value: string) => dayjs(value).format('MMM D')

const tooltipLabelFormatter = (label: string) => dayjs(label).format('ddd, MMM D')

const tooltipContent = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; name?: string; color?: string }>; label?: string }) => {
  if (!active || !payload || payload.length === 0 || !label) return null
  return (
    <div className="min-w-[200px] space-y-2 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-200">
      <div className="font-semibold text-white">{tooltipLabelFormatter(label)}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
            {item.name}
          </span>
          <span>{item.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
    </div>
  )
}

const mergeSeries = (teams: TeamProjection[], showEstimates: boolean): CombinedPoint[] => {
  const combined = new Map<string, CombinedPoint>()

  teams.forEach((team) => {
    team.history.forEach((point) => {
      const key = point.date.format('YYYY-MM-DD')
      const existing = combined.get(key) ?? { date: key }
      existing[`${team.name}-historical`] = point.points
      if (showEstimates && point.estimated) {
        existing[`${team.name}-historical-estimated`] = true
      }
      combined.set(key, existing)
    })

    team.projection.forEach((point, idx) => {
      const key = point.date.format('YYYY-MM-DD')
      const existing = combined.get(key) ?? { date: key }
      existing[`${team.name}-projection`] = point.points
      if (idx === 0) {
        existing[`${team.name}-projection-start`] = true
      }
      combined.set(key, existing)
    })
  })

  return Array.from(combined.values()).sort((a, b) => dayjs(a.date as string).valueOf() - dayjs(b.date as string).valueOf())
}

const projectionLineProps = (team: TeamProjection) => ({
  stroke: team.color,
  strokeWidth: 2,
  isAnimationActive: false,
  dot: false,
  activeDot: { r: 4 },
})

export const ProjectionChart = ({ teams, endDate, asOf, showEstimates, daysRemaining }: ProjectionChartProps) => {
  if (teams.length === 0) {
    return null
  }

  const data = mergeSeries(teams, showEstimates)
  const todayKey = dayjs(asOf).format('YYYY-MM-DD')

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Projection timeline</h3>
          {daysRemaining === 0 ? (
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              Challenge ended
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-400">Solid lines show historical cumulative points. Dashed lines project pace through {dayjs(endDate).format('MMM D')}.</p>
      </header>
      <div className="mt-4 h-80">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDateLabel} minTickGap={32} interval="preserveStartEnd" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => (typeof value === 'number' ? value.toLocaleString() : '')} width={72} />
            <Tooltip labelFormatter={tooltipLabelFormatter} content={tooltipContent} />
            <Legend />
            <ReferenceLine x={todayKey} stroke="#38bdf8" strokeDasharray="4 4" label={{ position: 'insideTop', value: 'Today', fill: '#38bdf8', fontSize: 10 }} />
            <ReferenceLine x={dayjs(endDate).format('YYYY-MM-DD')} stroke="#7c3aed" strokeDasharray="2 2" label={{ position: 'insideTop', value: dayjs(endDate).format('MMM D'), fill: '#c4b5fd', fontSize: 10 }} />

            {teams.map((team) => (
              <Fragment key={team.name}>
                <Line
                  type="monotone"
                  dataKey={`${team.name}-historical`}
                  name={`${team.name} (current)`}
                  {...projectionLineProps(team)}
                />
                <Line
                  type="monotone"
                  dataKey={`${team.name}-projection`}
                  name={`${team.name} (projected)`}
                  strokeDasharray="6 4"
                  {...projectionLineProps(team)}
                />
              </Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}


