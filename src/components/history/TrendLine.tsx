import { useMemo } from 'react'
import dayjs from 'dayjs'

import type { HistoryEntry } from '../../types.ts'

type TrendLineProps = {
  history: HistoryEntry[]
  teamName: string
}

const formatDateLabel = (timestamp: string) => dayjs(timestamp).format('MMM D')

const buildSparklinePath = (entries: HistoryEntry[], teamName: string) => {
  const points = entries
    .map((entry) => entry.teams.find((team) => team.name === teamName)?.teamPoints)
    .filter((value): value is number => typeof value === 'number')

  if (points.length === 0) return ''

  const maxValue = Math.max(...points)
  const minValue = Math.min(...points)
  const range = Math.max(maxValue - minValue, 1)

  return points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
}

export const TrendLine = ({ history, teamName }: TrendLineProps) => {
  const data = useMemo(
    () => history.filter((entry) => entry.teams.some((team) => team.name === teamName)),
    [history, teamName],
  )

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
        <div className="h-20 w-full animate-pulse rounded bg-slate-800/60" />
      </div>
    )
  }

  const path = buildSparklinePath(data, teamName)

  if (path.length === 0) {
    return <p className="text-sm text-rose-300">No team points recorded for {teamName}.</p>
  }

  return (
    <figure className="space-y-3">
      <svg viewBox="0 0 100 100" className="h-24 w-full rounded-lg border border-white/10 bg-slate-950/50">
        <path d={path} fill="none" stroke="url(#sparklineGradient)" strokeWidth={2} strokeLinecap="round" />
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <figcaption className="grid gap-1 text-xs text-slate-300">
        {data.map((entry) => {
          const team = entry.teams.find((candidate) => candidate.name === teamName)
          return (
            <div key={entry.savedAt} className="flex items-center justify-between rounded border border-white/10 bg-slate-900/30 px-3 py-1.5">
              <span>{formatDateLabel(entry.asOf)}</span>
              <span className="font-semibold text-white">{team?.teamPoints?.toLocaleString() ?? '—'}</span>
            </div>
          )
        })}
      </figcaption>
    </figure>
  )
}

