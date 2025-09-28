import type { DatasetConstants, Dataset } from '../types.ts'

export const DEFAULT_CONSTANTS: DatasetConstants = {
  stepsPerKmFoot: 1350,
  ptsPerKmRunWalk: 14,
  ptsPerKmBike: 7,
  ptsPer10kStepsBaseline: 60,
  stepMissionPts: {
    fiveK: 50,
    eightK: 30,
    tenK: 30,
  },
}

export const HISTORY_LIMIT = 14

export const DEMO_DATA: Dataset = {
  asOf: '2025-09-27T08:00:00Z',
  constants: { ...DEFAULT_CONSTANTS },
  teams: [
    {
      name: 'League',
      steps: 810_109,
      activityKm: 871.69,
      missions: 121,
      quizzes: 48,
      photos: 17,
      teamPoints: 20_171,
      boostActiveCount: 3,
    },
    {
      name: 'Les Sportifs',
      steps: 627_315,
      activityKm: 403.29,
      missions: 108,
      quizzes: 43,
      photos: 11,
      teamPoints: 15_582,
      boostActiveCount: 2,
    },
    {
      name: 'Protocole',
      steps: 949_448,
      activityKm: 700.46,
      missions: 140,
      quizzes: 50,
      photos: 30,
    },
    {
      name: 'RWD',
      steps: 795_017,
      activityKm: 758.93,
      missions: 129,
      quizzes: 43,
      photos: 24,
    },
    {
      name: 'Sanofi',
      steps: 785_920,
      activityKm: 401.39,
      missions: 123,
      quizzes: 43,
      photos: 29,
    },
    {
      name: 'Pas si vote',
      steps: 713_873,
      activityKm: 405.4,
      missions: 128,
      quizzes: 50,
      photos: 25,
    },
    {
      name: 'Wonder Woman',
      steps: 764_444,
      activityKm: 367.3,
      missions: 120,
      quizzes: 49,
      photos: 31,
    },
    {
      name: 'Razmoket',
      steps: 765_154,
      activityKm: 459.58,
      missions: 126,
      quizzes: 49,
      photos: 23,
    },
  ],
}

