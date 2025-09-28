import { InformationCircleIcon } from '@heroicons/react/24/outline'
import type { Dataset, TeamWithKPIs } from '../../types.ts'
import { getThreshold, THRESHOLDS } from '../../utils/thresholds.ts'

type MetricTileProps = {
  label: string
  value: string
  helper: string
  badge: string
  tone: string
}

const MetricTile = ({ label, value, helper, badge, tone }: MetricTileProps) => (
  <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-900/60 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${tone}`}>
        {badge}
      </span>
    </div>
    <p className="flex items-start gap-2 text-sm text-slate-300">
      <InformationCircleIcon aria-hidden className="mt-[3px] h-4 w-4 text-slate-500" />
      {helper}
    </p>
  </div>
)

const formatDecimal = (value: number, digits = 2) => value.toLocaleString(undefined, { maximumFractionDigits: digits })

type SummaryTilesProps = {
  dataset: Dataset
  teams: TeamWithKPIs[]
}

export const SummaryTiles = ({ dataset, teams }: SummaryTilesProps) => {
  if (teams.length === 0) {
    return (
      <section aria-label="Summary tiles" className="grid gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-6 text-slate-300">
        <p>No teams yet. Import CSV/JSON or add teams to see KPIs.</p>
      </section>
    )
  }

  const totals = teams.reduce(
    (acc, team) => {
      acc.steps += team.steps
      acc.activityKm += team.activityKm
      acc.missions += team.missions
      acc.quizzes += team.quizzes
      acc.photos += team.photos
      acc.teamPoints += team.teamPoints ?? team.kpis.estPoints
      return acc
    },
    { steps: 0, activityKm: 0, missions: 0, quizzes: 0, photos: 0, teamPoints: 0 },
  )

  const topYield = [...teams].sort((a, b) => b.kpis.ptsPer10kSteps - a.kpis.ptsPer10kSteps)[0]
  const topLogging = [...teams].sort((a, b) => b.kpis.loggingRate - a.kpis.loggingRate)[0]
  const topBike = [...teams].sort((a, b) => b.kpis.bikeShare - a.kpis.bikeShare)[0]
  const topMissions = [...teams].sort((a, b) => b.kpis.missionsPer100k - a.kpis.missionsPer100k)[0]

  const yieldThreshold = getThreshold(topYield.kpis.ptsPer10kSteps, THRESHOLDS.ptsPer10kSteps)
  const loggingThreshold = getThreshold(topLogging.kpis.loggingRate, THRESHOLDS.loggingRate)
  const bikeThreshold = getThreshold(topBike.kpis.bikeShare, THRESHOLDS.bikeShare)
  const missionThreshold = getThreshold(topMissions.kpis.missionsPer100k, THRESHOLDS.missionsPer100k)

  return (
    <section aria-label="Summary tiles" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Yield leader (pts / 10k)"
        value={`${formatDecimal(topYield.kpis.ptsPer10kSteps)} pts`}
        helper={`${topYield.name} converts every 10k steps into ${formatDecimal(topYield.kpis.ptsPer10kSteps)} points.`}
        badge={yieldThreshold.label}
        tone={yieldThreshold.badgeClass}
      />
      <MetricTile
        label="Logging rate leader"
        value={formatDecimal(topLogging.kpis.loggingRate * 100, 1) + '%'}
        helper={`${topLogging.name} records ${formatDecimal(topLogging.kpis.loggingRate * 100, 1)}% of walking as sessions.`}
        badge={loggingThreshold.label}
        tone={loggingThreshold.badgeClass}
      />
      <MetricTile
        label="Bike share leader"
        value={formatDecimal(topBike.kpis.bikeShare * 100, 1) + '%'}
        helper={`${topBike.name} rides bike for ${formatDecimal(topBike.kpis.bikeShare * 100, 1)}% of total km.`}
        badge={bikeThreshold.label}
        tone={bikeThreshold.badgeClass}
      />
      <MetricTile
        label="Missions density leader"
        value={formatDecimal(topMissions.kpis.missionsPer100k, 1)}
        helper={`${topMissions.name} completes ${formatDecimal(topMissions.kpis.missionsPer100k, 1)} missions per 100k steps.`}
        badge={missionThreshold.label}
        tone={missionThreshold.badgeClass}
      />
      <div className="sm:col-span-2 xl:col-span-4 rounded-xl border border-white/5 bg-slate-900/60 p-5">
        <h2 className="text-sm font-semibold text-slate-200">Total volume</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div>
            <dt className="text-slate-400">Steps</dt>
            <dd className="text-lg font-semibold text-white">{totals.steps.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Activity km</dt>
            <dd className="text-lg font-semibold text-white">{totals.activityKm.toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Missions</dt>
            <dd className="text-lg font-semibold text-white">{totals.missions.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Quizzes</dt>
            <dd className="text-lg font-semibold text-white">{totals.quizzes.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Photos</dt>
            <dd className="text-lg font-semibold text-white">{totals.photos.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Points (actual or est.)</dt>
            <dd className="text-lg font-semibold text-white">{totals.teamPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-400">
          Dataset date <time dateTime={dataset.asOf}>{new Date(dataset.asOf).toLocaleString()}</time>
        </p>
      </div>
    </section>
  )
}

