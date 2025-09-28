import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'

type SparklineDatum = {
  date: string
  value: number
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string> & { payload?: Array<{ value?: number }> }) => {
  if (!active || !payload || payload.length === 0) return null
  const [item] = payload
  if (!item || typeof item.value !== 'number') return null
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/90 px-2 py-1 text-xs text-slate-200">
      <div>{item.value.toFixed(0)} pts/10k</div>
    </div>
  )
}

export const Sparkline = ({ data }: { data: SparklineDatum[] }) => (
  <div className="h-14 w-32">
    <ResponsiveContainer>
      <LineChart data={data} margin={{ left: 0, right: 0, top: 6, bottom: 6 }}>
        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '3 3' }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

