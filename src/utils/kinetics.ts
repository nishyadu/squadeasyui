import dayjs from 'dayjs'

import type { DatasetConstants, HistoryEntry, TeamDailyKinetics, TeamInput } from '../types.ts'
import { computeKPIs } from './kpis.ts'

type AlignedPoint = {
  date: string
  points: number
  estimated: boolean
}

const alignTeamHistory = (history: HistoryEntry[], teamName: string, constants: DatasetConstants): AlignedPoint[] => {
  if (history.length === 0) return []

  const sorted = [...history].sort((a, b) => dayjs(a.asOf).valueOf() - dayjs(b.asOf).valueOf())
  const daily: AlignedPoint[] = []

  sorted.forEach((entry) => {
    const match = entry.teams.find((team) => team.name === teamName)
    if (!match) return
    const hasPoints = typeof match.teamPoints === 'number'

    const teamInput: TeamInput = {
      name: teamName,
      steps: match.steps ?? 0,
      activityKm: match.activityKm ?? 0,
      missions: match.missions ?? 0,
      quizzes: match.quizzes ?? 0,
      photos: match.photos ?? 0,
      teamPoints: match.teamPoints,
    }

    const kpis = computeKPIs(teamInput, entry.constants ?? constants)
    daily.push({
      date: dayjs(entry.asOf).format('YYYY-MM-DD'),
      points: hasPoints ? Math.round(match.teamPoints ?? 0) : Math.round(kpis.estPoints),
      estimated: !hasPoints,
    })
  })

  const filled: AlignedPoint[] = []
  for (let i = 0; i < daily.length; i += 1) {
    filled.push(daily[i])
    if (i === daily.length - 1) break

    const current = dayjs(daily[i].date)
    const next = dayjs(daily[i + 1].date)
    const gap = next.diff(current, 'day')
    if (gap > 1) {
      const delta = daily[i + 1].points - daily[i].points
      const step = delta / gap
      for (let offset = 1; offset < gap; offset += 1) {
        filled.push({
          date: current.add(offset, 'day').format('YYYY-MM-DD'),
          points: Math.round(daily[i].points + step * offset),
          estimated: true,
        })
      }
    }
  }

  return filled.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
}

const computeVelocityAndAcceleration = (series: AlignedPoint[], alphaV: number, alphaA: number) => {
  const kinetics: TeamDailyKinetics['series'] = []
  let prevPoint: AlignedPoint | undefined
  let prevVelocity: number | undefined
  let prevVelocityEMA: number | undefined
  let prevAccelEMA: number | undefined

  series.forEach((point) => {
    let velocity = 0
    let acceleration = 0

    if (prevPoint) {
      const days = Math.max(dayjs(point.date).diff(prevPoint.date, 'day'), 1)
      velocity = (point.points - prevPoint.points) / days
      if (prevVelocity !== undefined) {
        acceleration = velocity - prevVelocity
      }
    }

    const velocityEMA = prevVelocityEMA === undefined ? velocity : alphaV * velocity + (1 - alphaV) * prevVelocityEMA
    const accelEMA = prevAccelEMA === undefined ? acceleration : alphaA * acceleration + (1 - alphaA) * prevAccelEMA

    kinetics.push({
      date: point.date,
      points: point.points,
      velocity,
      velocityEMA,
      acceleration,
      accelEMA,
      estimated: point.estimated,
    })

    prevPoint = point
    prevVelocity = velocity
    prevVelocityEMA = velocityEMA
    prevAccelEMA = accelEMA
  })

  return kinetics
}

export const buildDailyKinetics = (history: HistoryEntry[], constants: DatasetConstants, alphaV = 0.4, alphaA = 0.4): TeamDailyKinetics[] => {
  const teams = history[history.length - 1]?.teams ?? []
  return teams.map((team) => {
    const aligned = alignTeamHistory(history, team.name, constants)
    const series = computeVelocityAndAcceleration(aligned, alphaV, alphaA)
    return {
      name: team.name,
      series,
    }
  })
}


