import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RechartTooltip,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from 'recharts'
import type { TeamWithKPIs } from '../../types.ts'
import { getTeamColor } from '../../utils/colors.ts'

type TeamChartsProps = {
  teams: TeamWithKPIs[]
}

const scatterData = (teams: TeamWithKPIs[]) =>
  teams.map((team, index) => ({
    name: team.name,
    loggingRate: Number((team.kpis.loggingRate * 100).toFixed(1)),
    ptsPer10kSteps: Number(team.kpis.ptsPer10kSteps.toFixed(0)),
    size: Math.round(team.teamPoints ?? team.kpis.estPoints),
    color: getTeamColor(team.name, index),
  }))

const groupedData = (teams: TeamWithKPIs[]) =>
  teams.map((team) => ({
    name: team.name,
    missions: Number(team.kpis.missionsPer100k.toFixed(1)),
    quizzes: Number(team.kpis.quizPer100k.toFixed(1)),
    photos: Number(team.kpis.photoPer100k.toFixed(1)),
  }))

const kmData = (teams: TeamWithKPIs[]) =>
  teams.map((team, index) => ({
    name: team.name,
    kmPer10kSteps: Number(team.kpis.kmPer10kSteps.toFixed(1)),
    color: getTeamColor(team.name, index),
  }))

const donutData = (teams: TeamWithKPIs[]) =>
  teams.map((team) => ({
    name: team.name,
    bike: Number((team.kpis.bikeShare * 100).toFixed(1)),
    foot: Number(((1 - team.kpis.bikeShare) * 100).toFixed(1)),
  }))

export const TeamCharts = ({ teams }: TeamChartsProps) => {
  if (teams.length === 0) {
    return null
  }

  return (
    <section className="mt-12 space-y-8">
      <header>
        <h2 className="text-lg font-semibold text-slate-200">Comparison charts</h2>
        <p className="text-sm text-slate-400">Visualize logging, yield, missions, and bike mix across teams.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <figure className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <figcaption className="text-sm font-semibold text-slate-200">Yield vs Logging</figcaption>
          <div className="h-72">
            <ResponsiveContainer>
              <ScatterChart margin={{ left: 12, right: 12, top: 20, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" dataKey="loggingRate" name="Logging rate" unit="%" stroke="#94a3b8" domain={[60, 110]} />
                <YAxis type="number" dataKey="ptsPer10kSteps" name="Points per 10k" stroke="#94a3b8" domain={[150, 'auto']} />
                <ZAxis type="number" dataKey="size" range={[100, 400]} name="Points" />
                <RechartTooltip cursor={{ strokeDasharray: '3 3' }} wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', color: '#e2e8f0', padding: '0.75rem' }} />
                <Scatter name="Teams" data={scatterData(teams)}>
                  {scatterData(teams).map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-slate-400">Bubble size = actual/estimated team points. Color shifts with bike share.</p>
        </figure>

        <figure className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <figcaption className="text-sm font-semibold text-slate-200">Engagement density</figcaption>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={groupedData(teams)}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Missions" dataKey="missions" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                <Radar name="Quizzes" dataKey="quizzes" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                <Radar name="Photos" dataKey="photos" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-slate-400">Compare missions, quizzes, and photo challenges per 100k steps.</p>
        </figure>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <figure className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <figcaption className="text-sm font-semibold text-slate-200">KM per 10k steps</figcaption>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={kmData(teams)} margin={{ left: 12, right: 12, top: 20, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <RechartTooltip wrapperStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', padding: '0.75rem' }} />
                <Bar dataKey="kmPer10kSteps">
                  {kmData(teams).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </figure>

        <figure className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <figcaption className="text-sm font-semibold text-slate-200">Bike mix</figcaption>
          <div className="grid gap-4 md:grid-cols-2">
            {donutData(teams).map((entry) => (
              <div key={entry.name} className="flex flex-col items-center">
                <div className="h-40 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie dataKey="value" data={[{ name: 'Bike', value: entry.bike }, { name: 'Foot', value: entry.foot }]} innerRadius={40} outerRadius={60} paddingAngle={2}>
                        <Cell key={`${entry.name}-bike`} fill="#38bdf8" />
                        <Cell key={`${entry.name}-foot`} fill="#22c55e" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400">
                  {entry.name}: {entry.bike}% bike / {entry.foot}% foot
                </p>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </section>
  )
}

