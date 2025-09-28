export type Member = {
  name: string
  points: number
}

export type TeamInput = {
  name: string
  steps: number
  activityKm: number
  missions: number
  quizzes: number
  photos: number
  teamPoints?: number
  members?: Member[]
  boostActiveCount?: number
}

export type DatasetConstants = {
  stepsPerKmFoot: number
  ptsPerKmRunWalk: number
  ptsPerKmBike: number
  ptsPer10kStepsBaseline: number
  stepMissionPts: { fiveK: number; eightK: number; tenK: number }
}

export type Dataset = {
  asOf: string
  challengeStartDate?: string
  teams: TeamInput[]
  constants: DatasetConstants
}

export type TeamKPIs = {
  stepsPerKm: number
  kmPer10kSteps: number
  loggingRate: number
  bikeShare: number
  missionsPer100k: number
  ptsPer10kSteps: number
  ptsPerKm: number
  quizPer100k: number
  photoPer100k: number
  balanceCV?: number
  boostCoverage?: number
  estPoints: number
  notes: string[]
}

export type TeamWithKPIs = TeamInput & {
  kpis: TeamKPIs
}

export type HistoryEntry = Dataset & {
  savedAt: string
}

export type HistoryPoint = {
  asOf: string
  teams: {
    name: string
    teamPoints?: number
    steps?: number
    activityKm?: number
    missions?: number
    quizzes?: number
    photos?: number
    boostActiveCount?: number
  }[]
  constants?: DatasetConstants
}

export type TeamDailyKinetics = {
  name: string
  series: Array<{
    date: string
    points: number
    velocity: number
    velocityEMA?: number
    acceleration: number
    accelEMA?: number
    estimated?: boolean
  }>
}

export type KineticsConfig = {
  velocityAlpha: number
  accelerationAlpha: number
}

