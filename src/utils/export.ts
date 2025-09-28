import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import type { Dataset, TeamInput, TeamDailyKinetics } from '../types.ts'
import { exportDatasetToJSON, exportTeamsToCSV } from './csv.ts'

export const exportDatasetJSON = (dataset: Dataset) => {
  const blob = new Blob([exportDatasetToJSON(dataset)], { type: 'application/json' })
  saveAs(blob, `squad-analytics-${dayjs().format('YYYY-MM-DD')}.json`)
}

export const exportTeamsCSV = (teams: TeamInput[]) => {
  const blob = new Blob([exportTeamsToCSV(teams)], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `squad-analytics-${dayjs().format('YYYY-MM-DD')}.csv`)
}

export const exportKineticsCSV = (teams: Array<{ name: string; series: TeamDailyKinetics['series'] }>) => {
  const header = 'team,date,points,velocity,velocityEMA,acceleration,accelEMA,estimated\n'
  const rows = teams
    .flatMap((team) =>
      team.series.map((point) => [team.name, point.date, point.points, point.velocity, point.velocityEMA ?? '', point.acceleration, point.accelEMA ?? '', point.estimated ? 'yes' : 'no'].join(',')),
    )
    .join('\n')

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `acceleration-${dayjs().format('YYYY-MM-DD')}.csv`)
}

