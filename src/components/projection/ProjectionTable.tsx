import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import type { TeamProjection } from './types.ts'
import { fmt1, fmtInt } from '../../utils/format.ts'

type ProjectionTableProps = {
  teams: TeamProjection[]
  daysRemaining: number
  showEstimates: boolean
  challengeEnded: boolean
}

type SortKey = 'projected' | 'current' | 'pace'

const sorters: Record<SortKey, (team: TeamProjection) => number> = {
  projected: (team) => team.projected,
  current: (team) => team.current,
  pace: (team) => team.pacePerDay,
}

const paceBadgeTone = (pace: number) => {
  if (pace > 300) return 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'
  if (pace >= 150) return 'text-sky-200 bg-sky-500/10 border-sky-500/30'
  if (pace > 0) return 'text-amber-200 bg-amber-500/10 border-amber-500/30'
  return 'text-slate-200 bg-slate-700/20 border-slate-500/30'
}

const paceBadgeLabel = (pace: number) => {
  if (pace > 300) return 'Fast'
  if (pace >= 150) return 'Moderate'
  if (pace > 0) return 'Slow'
  return 'Flat'
}

const SortChevron = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => (
  <span className="flex flex-col leading-none">
    <span className={`text-[9px] ${active && direction === 'asc' ? 'text-emerald-300' : 'text-slate-500'}`}>▲</span>
    <span className={`text-[9px] ${active && direction === 'desc' ? 'text-emerald-300' : 'text-slate-500'}`}>▼</span>
  </span>
)

export const ProjectionTable = ({ teams, daysRemaining, showEstimates, challengeEnded }: ProjectionTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('projected')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const key = sortKey
    const selector = sorters[key]
    const items = teams.slice().sort((a, b) => selector(b) - selector(a))
    return sortDir === 'asc' ? items.reverse() : items
  }, [teams, sortKey, sortDir])

  const handleSortClick = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('desc')
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
        Not enough history yet. Save snapshots to unlock projections.
      </div>
    )
  }

  const tooltipCopy = {
    pace: 'Average points gained per day over the selected lookback (least-squares).',
    projected: 'Current points + Pace/day × Days remaining.',
    delta: 'Projected difference to the top team on the end date.',
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 text-sm text-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Projection table</h3>
          <p className="text-xs text-slate-400">Ranked by projected points on {dayjs(sorted[0]?.projection.at(-1)?.date ?? teams[0].projection.at(-1)?.date).format('MMM D')}.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-emerald-200">{daysRemaining} days remaining</span>
          {showEstimates ? <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-amber-200">≈ includes estimates</span> : null}
          {challengeEnded ? <span className="rounded-full border border-slate-500/30 bg-slate-600/20 px-2 py-0.5 text-slate-200">Challenge ended</span> : null}
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2" title={tooltipCopy.pace}>
                <button type="button" className="flex items-center gap-1" onClick={() => handleSortClick('pace')}>
                  Pace/day
                  <SortChevron active={sortKey === 'pace'} direction={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="flex items-center gap-1" onClick={() => handleSortClick('current')}>
                  Current
                  <SortChevron active={sortKey === 'current'} direction={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2" title={tooltipCopy.projected}>
                <button type="button" className="flex items-center gap-1" onClick={() => handleSortClick('projected')}>
                  Projected @ End
                  <SortChevron active={sortKey === 'projected'} direction={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2" title={tooltipCopy.delta}>Δ to Leader</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team) => (
              <tr key={team.name} className="border-t border-white/5 text-xs">
                <td className="px-3 py-2 text-white">#{team.rank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} aria-hidden />
                    <span className="font-semibold text-white">{team.name}</span>
                    {team.usedEstimates && showEstimates ? (
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200" title="estimated from KPIs">
                        ≈
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${paceBadgeTone(team.pacePerDay)}`}>
                      {paceBadgeLabel(team.pacePerDay)}
                    </span>
                    <span className="text-white" title={tooltipCopy.pace}>
                      {fmt1(team.pacePerDay)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-white">
                  <span title={team.usedEstimates && showEstimates ? 'estimated from KPIs' : undefined}>{fmtInt(team.current)}</span>
                </td>
                <td className="px-3 py-2 text-white" title={tooltipCopy.projected}>
                  {fmtInt(team.projected)}
                </td>
                <td className="px-3 py-2 text-white" title={tooltipCopy.delta}>
                  {fmtInt(team.deltaToLeader)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


