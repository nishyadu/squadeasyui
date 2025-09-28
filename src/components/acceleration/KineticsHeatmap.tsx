import dayjs from 'dayjs'

import type { TeamDailyKinetics } from '../../types.ts'

type HeatmapProps = {
  teams: Array<{ name: string; series: TeamDailyKinetics['series'] }>
  onTeamSelect: (teamName: string) => void
  onDateSelect: (date: string) => void
}

const colorScale = (value: number) => {
  if (!Number.isFinite(value)) return 'bg-slate-800'
  const max = 400
  const clamped = Math.max(Math.min(value, max), -max)
  if (clamped === 0) return 'bg-slate-700'
  if (clamped > 0) {
    const intensity = Math.round((clamped / max) * 100)
    return `bg-orange-500/${30 + intensity / 2}`
  }
  const intensity = Math.round((Math.abs(clamped) / max) * 100)
  return `bg-sky-500/${30 + intensity / 2}`
}

export const KineticsHeatmap = ({ teams, onTeamSelect, onDateSelect }: HeatmapProps) => {
  const dates = teams[0]?.series.map((point) => point.date) ?? []

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-white">Acceleration Heatmap</h3>
        <p className="text-xs text-slate-400">Click a cell to focus the chart on that team and date window.</p>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-xs text-slate-300">
          <thead>
            <tr>
              <th className="w-32 px-2 py-2 text-left">Team</th>
              {dates.map((date) => (
                <th key={date} className="px-1 py-2 text-center text-[10px] text-slate-500">
                  {dayjs(date).format('MM/DD')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.name}>
                <td className="px-2 py-1 font-semibold text-white">{team.name}</td>
                {team.series.map((point) => (
                  <td key={point.date} className="px-1 py-1">
                    <button
                      type="button"
                      className={`flex h-6 w-full items-center justify-center rounded ${colorScale(point.acceleration)} text-[10px] text-slate-950 transition hover:brightness-125`}
                      onClick={() => {
                        onTeamSelect(team.name)
                        onDateSelect(point.date)
                      }}
                      title={`${team.name} · ${dayjs(point.date).format('MMM D')}: ${point.acceleration.toFixed(1)} pts/day²`}
                    >
                      {Math.round(point.acceleration)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


