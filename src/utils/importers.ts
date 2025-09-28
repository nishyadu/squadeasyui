import Papa from 'papaparse'
import type { Dataset, TeamInput } from '../types.ts'

export const importTeamsFromFile = async (file: File): Promise<TeamInput[]> => {
  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    const text = await file.text()
    const dataset = JSON.parse(text) as Dataset
    return dataset.teams
  }

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const teams = (results.data as Record<string, string>[]).map((row) => ({
          name: (row.name ?? '').trim(),
          steps: Number(row.steps ?? 0),
          activityKm: Number(row.activityKm ?? 0),
          missions: Number(row.missions ?? 0),
          quizzes: Number(row.quizzes ?? 0),
          photos: Number(row.photos ?? 0),
          teamPoints: row.teamPoints ? Number(row.teamPoints) : undefined,
          boostActiveCount: row.boostActiveCount ? Number(row.boostActiveCount) : undefined,
        }))
        resolve(teams)
      },
      error: (error) => reject(error),
    })
  })
}

