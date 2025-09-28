import { Fragment, useEffect, useMemo, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'

import type { Dataset, DatasetConstants, TeamWithKPIs } from '../../types.ts'
import { formatPercent } from '../../utils/format.ts'
import { getThreshold, THRESHOLDS } from '../../utils/thresholds.ts'
import { generateInsights } from '../../utils/insights.ts'
import { DonutTiny, KpiBar, Pill } from '../visuals/index.ts'
import { computeKPIs } from '../../utils/kpis.ts'
import { withDailyStats, type DailyStats } from './withDailyStats.ts'

type SortKey =
  | 'name'
  | 'totalPoints'
  | 'pointsPerDay'
  | 'activityKm'
  | 'kmPerDay'
  | 'steps'
  | 'stepsPerDay'
  | 'ptsPer10kSteps'
  | 'loggingRate'
  | 'bikeShare'
  | 'missionsPer100k'

type SortOrder = {
  key: SortKey
  direction: 'asc' | 'desc'
}

type TeamsComparisonGridProps = {
  teams: TeamWithKPIs[]
  constants: DatasetConstants
  dataset: Dataset
  onDrillDown: (team: TeamWithKPIs) => void
}

type TeamWithDaily = TeamWithKPIs & { daily: DailyStats }

const SORT_STORAGE_KEY = 'squad-analytics:grid-sort'

const metricHeaders: Array<{ label: string; key: SortKey; tooltip: string; className?: string }> = [
  { label: 'Team', key: 'name', tooltip: 'Team name and quick KPIs.', className: 'min-w-[220px] sm:sticky sm:left-0 sm:bg-slate-950/90 sm:backdrop-blur' },
  { label: 'Total Points', key: 'totalPoints', tooltip: 'Sum of team points (or estimated if not provided).' },
  { label: 'Points/Day', key: 'pointsPerDay', tooltip: 'Total Points ÷ Days since challenge start.' },
  { label: 'Total Km', key: 'activityKm', tooltip: 'Sum of recorded activity kilometers.' },
  { label: 'Km/Day', key: 'kmPerDay', tooltip: 'Total Km ÷ Days since challenge start.' },
  { label: 'Total Steps', key: 'steps', tooltip: 'Sum of steps.' },
  { label: 'Steps/Day', key: 'stepsPerDay', tooltip: 'Total Steps ÷ Days since challenge start.' },
  { label: 'Pts/10k Steps', key: 'ptsPer10kSteps', tooltip: '(Points ÷ Steps) × 10,000 — overall yield per effort.' },
  { label: 'Logging Rate', key: 'loggingRate', tooltip: 'Recorded km ÷ step-derived foot km — how much walking becomes sessions.' },
  { label: 'Bike Split', key: 'bikeShare', tooltip: 'Estimated % of km from cycling (km beyond foot-km from steps).' },
  { label: 'Mission Density', key: 'missionsPer100k', tooltip: 'Missions per 100k steps — join 5k/8k/10k before moving.' },
]

const loadSort = (): SortOrder => {
  if (typeof window === 'undefined') {
    return { key: 'totalPoints', direction: 'desc' }
  }
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY)
    if (!raw) return { key: 'totalPoints', direction: 'desc' }
    const parsed = JSON.parse(raw) as SortOrder
    return parsed
  } catch (error) {
    console.error('Failed to load sort preference', error)
    return { key: 'totalPoints', direction: 'desc' }
  }
}

const storeSort = (sort: SortOrder) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort))
  } catch (error) {
    console.error('Failed to store sort preference', error)
  }
}

const valueForSort = (team: TeamWithDaily, key: SortKey): number | string => {
  switch (key) {
    case 'name':
      return team.name
    case 'totalPoints':
      return team.daily.totalPoints
    case 'pointsPerDay':
      return team.daily.pointsPerDay
    case 'activityKm':
      return team.activityKm
    case 'kmPerDay':
      return team.daily.kmPerDay
    case 'steps':
      return team.steps
    case 'stepsPerDay':
      return team.daily.stepsPerDay
    case 'ptsPer10kSteps':
      return team.kpis.ptsPer10kSteps
    case 'loggingRate':
      return team.kpis.loggingRate
    case 'bikeShare':
      return team.kpis.bikeShare
    case 'missionsPer100k':
      return team.kpis.missionsPer100k
    default:
      return 0
  }
}

const useSortedTeams = (teams: TeamWithDaily[]) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => loadSort())

  useEffect(() => {
    storeSort(sortOrder)
  }, [sortOrder])

  const sorted = useMemo(() => {
    const copy = [...teams]
    copy.sort((a, b) => {
      const valueA = valueForSort(a, sortOrder.key)
      const valueB = valueForSort(b, sortOrder.key)

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      const numberA = Number(valueA)
      const numberB = Number(valueB)
      return sortOrder.direction === 'asc' ? numberA - numberB : numberB - numberA
    })
    return copy
  }, [teams, sortOrder])

  return {
    sorted,
    sortOrder,
    setSortOrder,
  }
}

const SortButton = ({ label, active, direction, tooltip }: { label: string; active: boolean; direction: 'asc' | 'desc'; tooltip: string }) => (
  <span className="inline-flex items-center gap-1 text-xs font-medium" title={tooltip}>
    {label}
    <span className="flex flex-col text-[10px] leading-none text-slate-400">
      <span className={classNames({ 'text-emerald-300': active && direction === 'asc' })}>▲</span>
      <span className={classNames({ 'text-emerald-300': active && direction === 'desc' })}>▼</span>
    </span>
  </span>
)

const LoggingBar = ({ value }: { value: number }) => {
  const threshold = getThreshold(value, THRESHOLDS.loggingRate)
  return <KpiBar value={value} max={1} label={`${formatPercent(value, 0)}`} tone={threshold.tone} markers={[0.8, 0.95, 1]} />
}

const MissionsBar = ({ value }: { value: number }) => {
  const threshold = getThreshold(value, THRESHOLDS.missionsPer100k)
  return <KpiBar value={value} max={25} label={`${value.toFixed(1)}`} tone={threshold.tone} target={17} />
}

const BikeBadge = ({ value }: { value: number }) => {
  const threshold = getThreshold(value, THRESHOLDS.bikeShare)
  return <Pill label={`${formatPercent(value, 0)}`} tone={threshold.tone} tooltip="Estimated % of km from cycling (km beyond foot-km from steps)." />
}

const formatCompact = (value: number): string => {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1000) {
    return `${Math.round(value / 1000)}k`
  }
  return Math.round(value).toString()
}

const formatWhole = (value: number): string => (Number.isFinite(value) ? Math.round(value).toString() : '—')

const TeamRow = ({
  team,
  constants,
  onDrillDown,
}: {
  team: TeamWithDaily
  constants: DatasetConstants
  onDrillDown: (team: TeamWithKPIs) => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const insights = useMemo(() => generateInsights(team, team.kpis, constants).slice(0, 5), [team, constants])

  return (
    <Fragment>
      <tr className="hidden border-b border-white/5 bg-slate-950/40 text-sm transition hover:bg-slate-900/60 sm:table-row">
        <th scope="row" className="sticky left-0 z-10 min-w-[200px] bg-slate-950/60 px-4 py-3 text-left text-sm font-semibold text-white">
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-300 transition hover:bg-white/10" onClick={() => setExpanded((prev) => !prev)} aria-label={expanded ? `Collapse ${team.name}` : `Expand ${team.name}`}>
              {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
            <span>{team.name}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>Days: {team.daily.daysSoFar}</span>
            {team.daily.isEstimated ? <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">Est.</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
            <Pill label={`Quiz ${team.kpis.quizPer100k.toFixed(1)}/100k`} tone="neutral" tooltip="Quizzes per 100k steps" />
            <Pill label={`Photo ${team.kpis.photoPer100k.toFixed(1)}/100k`} tone="neutral" tooltip="Photos per 100k steps" />
          </div>
        </th>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatCompact(team.daily.totalPoints)}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatWhole(team.daily.pointsPerDay)}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{Math.round(team.activityKm).toLocaleString()}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatWhole(team.daily.kmPerDay)}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatCompact(team.steps)}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatCompact(team.daily.stepsPerDay)}</div>
        </td>
        <td className="px-4 py-3 align-middle text-sm text-white">
          <div className="text-base font-semibold">{formatWhole(team.kpis.ptsPer10kSteps)}</div>
        </td>
        <td className="px-4 py-3 align-middle">
          <LoggingBar value={team.kpis.loggingRate} />
        </td>
        <td className="px-4 py-3 align-middle">
          <div className="flex items-center gap-2">
            <DonutTiny bikeShare={team.kpis.bikeShare} />
            <BikeBadge value={team.kpis.bikeShare} />
          </div>
        </td>
        <td className="px-4 py-3 align-middle">
          <MissionsBar value={team.kpis.missionsPer100k} />
        </td>
        <td className="px-4 py-3 align-middle text-right">
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-200 transition hover:bg-white/10" onClick={() => onDrillDown(team)}>
            Drill down
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="hidden bg-slate-950/80 text-sm text-slate-300 sm:table-row">
          <td colSpan={12} className="border-b border-white/5 px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt>Steps per km</dt><dd>{team.kpis.stepsPerKm.toFixed(1)}</dd></div>
                <div className="flex justify-between"><dt>Points per km</dt><dd>{team.kpis.ptsPerKm.toFixed(1)}</dd></div>
                <div className="flex justify-between"><dt>Days tracked</dt><dd>{team.daily.daysSoFar}</dd></div>
              </dl>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Insights & Actions</h4>
                <ul className="mt-2 space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-emerald-100">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  )
}

const MobileTeamCard = ({ team, constants, onDrillDown }: { team: TeamWithDaily; constants: DatasetConstants; onDrillDown: (team: TeamWithKPIs) => void }) => {
  const [expanded, setExpanded] = useState(false)
  const insights = useMemo(() => generateInsights(team, team.kpis, constants).slice(0, 4), [team, constants])

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-200 sm:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-slate-400">Days: {team.daily.daysSoFar}</p>
        </div>
        <button type="button" className="rounded-full border border-white/10 bg-white/5 p-1" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>
            <div className="text-sm font-semibold text-white">{formatCompact(team.daily.totalPoints)}</div>
            <p>Total Points</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{formatWhole(team.daily.pointsPerDay)}</div>
            <p>Points/Day</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{Math.round(team.activityKm).toLocaleString()}</div>
            <p>Total Km</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{formatWhole(team.daily.kmPerDay)}</div>
            <p>Km/Day</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{formatCompact(team.steps)}</div>
            <p>Total Steps</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{formatCompact(team.daily.stepsPerDay)}</div>
            <p>Steps/Day</p>
          </div>
        </div>
        <div className="text-xs text-slate-300">
          <div className="text-sm font-semibold text-white">{formatWhole(team.kpis.ptsPer10kSteps)}</div>
          <p>Pts/10k Steps</p>
        </div>
        <LoggingBar value={team.kpis.loggingRate} />
        <div className="flex items-center gap-2">
          <DonutTiny bikeShare={team.kpis.bikeShare} />
          <BikeBadge value={team.kpis.bikeShare} />
        </div>
        <MissionsBar value={team.kpis.missionsPer100k} />
        <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-wide text-slate-200 transition hover:bg-white/10" onClick={() => onDrillDown(team)}>
          Drill down
        </button>
      </div>
      {expanded ? (
        <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-300">
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-emerald-100">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

const buildTeamsWithDaily = (teams: TeamWithKPIs[], dataset: Dataset, constants: DatasetConstants): TeamWithDaily[] =>
  teams.map((team) => {
    const kpis = team.kpis ?? computeKPIs(team, constants)
    const daily = withDailyStats({ ...team, kpis } as TeamWithKPIs, kpis, dataset)
    return { ...team, kpis, daily }
  })

export const TeamsComparisonGrid = ({ teams, constants, dataset, onDrillDown }: TeamsComparisonGridProps) => {
  const teamsWithDaily = useMemo(() => buildTeamsWithDaily(teams, dataset, constants), [teams, dataset, constants])
  const { sorted, sortOrder, setSortOrder } = useSortedTeams(teamsWithDaily)

  if (teams.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
        No teams yet. Import data or add a team to start analysis.
      </section>
    )
  }

  const handleSortClick = (key: SortKey) => {
    setSortOrder((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'desc' }
    })
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
      <table className="hidden min-w-full text-left sm:table">
        <thead className="sticky top-0 z-10 bg-slate-950/90 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {metricHeaders.map((header) => (
              <th key={header.key} scope="col" className={classNames('px-4 py-3', header.className)}>
                <button type="button" className="flex items-center gap-2" onClick={() => handleSortClick(header.key)} aria-label={`Sort by ${header.label}`}>
                  <SortButton label={header.label} tooltip={header.tooltip} active={sortOrder.key === header.key} direction={sortOrder.direction} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team) => (
            <TeamRow key={team.name} team={team} constants={constants} onDrillDown={onDrillDown} />
          ))}
        </tbody>
      </table>
      <div className="grid gap-4 border-t border-white/5 p-4 sm:hidden">
        {sorted.map((team) => (
          <MobileTeamCard key={team.name} team={team} constants={constants} onDrillDown={onDrillDown} />
        ))}
      </div>
    </div>
  )
}
