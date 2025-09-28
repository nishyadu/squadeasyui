import dayjs from 'dayjs'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { HistoryEntry } from '../../types.ts'

type TrendLineProps = {
  history: HistoryEntry[]
  teamName: string
}

export const TrendLine = ({ history, teamName }: TrendLineProps) => {
  const data = history
    .map((entry) => {
      const team = entry.teams.find((teamItem) => teamItem.name === teamName)
      if (!team) return null
      return {
        date: dayjs(entry.asOf).format('MMM D'),
        ptsPer10k: team.teamPoints ? team.teamPoints / (team.steps / 10000) : 0,
        loggingRate: (team.activityKm / (team.steps / entry.constants.stepsPerKmFoot)) * 100,
      }
    })
    .filter((point): point is { date: string; ptsPer10k: number; loggingRate: number } => Boolean(point))

  if (data.length < 2) {
    return <p className="text-sm text-slate-400">Not enough history yet. Save snapshots to build trendlines.</p>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#22c55e" />
          <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" />
          <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', padding: '0.75rem' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="ptsPer10k" stroke="#22c55e" strokeWidth={2} name="Pts/10k" />
          <Line yAxisId="right" type="monotone" dataKey="loggingRate" stroke="#38bdf8" strokeWidth={2} name="Logging %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

