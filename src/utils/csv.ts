import Papa from 'papaparse'
import type { Dataset, TeamInput } from '../types.ts'

export const exportTeamsToCSV = (teams: TeamInput[]): string =>
  Papa.unparse(
    teams.map((team) => ({
      name: team.name,
      steps: team.steps,
      activityKm: team.activityKm,
      missions: team.missions,
      quizzes: team.quizzes,
      photos: team.photos,
      teamPoints: team.teamPoints ?? '',
      boostActiveCount: team.boostActiveCount ?? '',
    })),
  )

export const parseTeamsFromCSV = (csv: string): TeamInput[] => {
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true })

  return (result.data as Record<string, string>[]).map((row) => ({
    name: (row.name ?? '').trim(),
    steps: Number(row.steps ?? 0),
    activityKm: Number(row.activityKm ?? 0),
    missions: Number(row.missions ?? 0),
    quizzes: Number(row.quizzes ?? 0),
    photos: Number(row.photos ?? 0),
    teamPoints: row.teamPoints ? Number(row.teamPoints) : undefined,
    boostActiveCount: row.boostActiveCount ? Number(row.boostActiveCount) : undefined,
  }))
}

export const exportDatasetToJSON = (dataset: Dataset) => JSON.stringify(dataset, null, 2)

