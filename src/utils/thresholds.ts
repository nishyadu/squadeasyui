export type Threshold = {
  label: string
  min?: number
  max?: number
  color: string
  tone: 'good' | 'watch' | 'fix' | 'neutral'
  badgeClass: string
}

const LOGGING_THRESHOLDS: Threshold[] = [
  { label: 'Good', min: 0.95, color: 'text-emerald-300', tone: 'good', badgeClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' },
  { label: 'Watch', min: 0.8, max: 0.95, color: 'text-amber-300', tone: 'watch', badgeClass: 'bg-amber-500/10 text-amber-300 border border-amber-600/30' },
  { label: 'Fix', max: 0.8, color: 'text-rose-300', tone: 'fix', badgeClass: 'bg-rose-500/10 text-rose-300 border border-rose-600/30' },
]

const BIKE_THRESHOLDS: Threshold[] = [
  { label: 'None', max: 0.05, color: 'text-slate-300', tone: 'neutral', badgeClass: 'bg-slate-500/10 text-slate-300 border border-slate-600/30' },
  { label: 'Light', min: 0.05, max: 0.15, color: 'text-sky-300', tone: 'watch', badgeClass: 'bg-sky-500/10 text-sky-300 border border-sky-600/30' },
  { label: 'Moderate', min: 0.15, max: 0.3, color: 'text-emerald-300', tone: 'good', badgeClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-600/30' },
  { label: 'Heavy', min: 0.3, color: 'text-purple-300', tone: 'good', badgeClass: 'bg-purple-500/10 text-purple-300 border border-purple-600/30' },
]

const MISSIONS_THRESHOLDS: Threshold[] = [
  { label: 'Good', min: 17, color: 'text-emerald-300', tone: 'good', badgeClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' },
  { label: 'Ok', min: 15, max: 17, color: 'text-amber-300', tone: 'watch', badgeClass: 'bg-amber-500/10 text-amber-300 border border-amber-600/30' },
  { label: 'Low', max: 15, color: 'text-rose-300', tone: 'fix', badgeClass: 'bg-rose-500/10 text-rose-300 border border-rose-600/30' },
]

const YIELD_THRESHOLDS: Threshold[] = [
  { label: 'Elite', min: 230, color: 'text-emerald-300', tone: 'good', badgeClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' },
  { label: 'Solid', min: 200, max: 230, color: 'text-sky-300', tone: 'watch', badgeClass: 'bg-sky-500/10 text-sky-300 border border-sky-600/30' },
  { label: 'Low', max: 200, color: 'text-rose-300', tone: 'fix', badgeClass: 'bg-rose-500/10 text-rose-300 border border-rose-600/30' },
]

const KM_PER_10K_THRESHOLDS: Threshold[] = [
  { label: 'Bike-rich', min: 10, color: 'text-purple-300', tone: 'good', badgeClass: 'bg-purple-500/10 text-purple-300 border border-purple-600/30' },
  { label: 'Mixed', min: 8, color: 'text-emerald-300', tone: 'good', badgeClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' },
  { label: 'Walk/Run', min: 6.7, max: 8, color: 'text-sky-300', tone: 'watch', badgeClass: 'bg-sky-500/10 text-sky-300 border border-sky-600/30' },
]

export const THRESHOLDS = {
  loggingRate: LOGGING_THRESHOLDS,
  bikeShare: BIKE_THRESHOLDS,
  missionsPer100k: MISSIONS_THRESHOLDS,
  ptsPer10kSteps: YIELD_THRESHOLDS,
  kmPer10kSteps: KM_PER_10K_THRESHOLDS,
} as const

export const getThreshold = (value: number, thresholds: Threshold[]): Threshold => {
  for (const threshold of thresholds) {
    const withinMin = threshold.min === undefined || value >= threshold.min
    const withinMax = threshold.max === undefined || value < threshold.max
    if (withinMin && withinMax) {
      return threshold
    }
  }
  return thresholds[thresholds.length - 1]
}

