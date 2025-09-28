import type { TeamDailyKinetics } from '../../types.ts'

const formatValue = (value: number) => `${Math.round(value)} pts/day²`

export const accelInsights = (team: TeamDailyKinetics, windowDays: number): string[] => {
  const series = team.series.slice(-windowDays)
  if (series.length === 0) return []

  const avgAcceleration = series.reduce((sum, point) => sum + point.acceleration, 0) / series.length
  const maxAccel = series.reduce((max, point) => (point.acceleration > max.acceleration ? { acceleration: point.acceleration, date: point.date } : max), {
    acceleration: Number.NEGATIVE_INFINITY,
    date: series[0].date,
  })
  const daysAccelerating = series.filter((point) => point.acceleration > 0).length
  const percentAccelerating = (daysAccelerating / series.length) * 100
  const velocityMean = series.reduce((sum, point) => sum + point.velocity, 0) / series.length
  const velocityVariance = series.reduce((sum, point) => sum + (point.velocity - velocityMean) ** 2, 0) / series.length
  const velocityStdDev = Math.sqrt(velocityVariance)

  const insights: string[] = []

  if (avgAcceleration > 50) {
    insights.push(`Pace is rising by ~${formatValue(avgAcceleration)}.`)
  } else if (avgAcceleration < -50) {
    insights.push(`Pace is fading by ~${formatValue(Math.abs(avgAcceleration))}.`)
  }

  if (maxAccel.acceleration > 300) {
    insights.push(`Big surge on ${maxAccel.date}: +${formatValue(maxAccel.acceleration)}; investigate missions/bike/logging.`)
  }

  if (percentAccelerating >= 60) {
    insights.push('Momentum is strong; keep mission cadence high.')
  }

  if (velocityStdDev > 250) {
    insights.push('Inconsistent daily gains; set a daily floor (10 km + step bundle).')
  }

  return insights
}


