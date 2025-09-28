import { useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { AppShell } from './components/layout/AppShell.tsx'
import { SummaryTiles } from './components/summary/index.ts'
import { TeamsComparisonGrid } from './components/teams/index.ts'
import { Modal } from './components/modals/index.ts'
import { TeamForm, SettingsForm } from './components/forms/index.ts'
import { TeamCharts } from './components/charts/index.ts'
import { TrendLine } from './components/history/index.ts'
import { ProjectionView } from './components/projection/index.ts'
import { AccelerationPage } from './components/acceleration/index.ts'

import type { Dataset, TeamWithKPIs } from './types.ts'
import { computeKPIs } from './utils/kpis.ts'
import { DEMO_DATA } from './utils/constants.ts'
import { exportDatasetJSON, exportTeamsCSV } from './utils/export.ts'
import { importTeamsFromFile } from './utils/importers.ts'
import { useDataset } from './hooks/useDataset.ts'

const aboutCopy =
  'Paste your team totals (Steps, Activity km, Missions, Quizzes, Photos, optional Team Points) and we compute objective KPIs. We estimate bike split by comparing your recorded km to step-derived foot km (assuming ~1,350 steps per km). We score logging rate (how much walking you actually record as sessions), mission density, and overall points per 10k steps. The colored badges and “Insights & Actions” tell each team exactly what to do next: log every walk as a session, add a modest bike pillar, and never miss step missions. Adjust model constants in Settings if your app’s payouts differ.'

const computeTeamsWithKPIs = (dataset: Dataset): TeamWithKPIs[] =>
  dataset.teams.map((team) => ({
    ...team,
    kpis: computeKPIs(team, dataset.constants),
  }))

const DrilldownContent = ({
  team,
  history,
}: {
  team: TeamWithKPIs
  history: ReturnType<typeof useDataset>['history']
}) => (
  <div className="space-y-6">
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h4 className="text-sm font-semibold text-slate-200">Key metrics</h4>
        <dl className="mt-3 grid gap-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <dt>Steps per km</dt>
            <dd>{team.kpis.stepsPerKm.toFixed(1)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>KM per 10k steps</dt>
            <dd>{team.kpis.kmPer10kSteps.toFixed(1)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Points per km</dt>
            <dd>{team.kpis.ptsPerKm.toFixed(1)}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h4 className="text-sm font-semibold text-slate-200">Notes</h4>
        {team.kpis.notes.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {team.kpis.notes.map((note, index) => (
              <li key={index} className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2 text-amber-200">
                {note}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No caveats—metrics look consistent.</p>
        )}
      </div>
    </section>
    <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-200">Trendline (last snapshots)</h4>
      <TrendLine history={history} teamName={team.name} />
    </section>
  </div>
)

const AboutContent = () => (
  <section className="space-y-4 text-sm text-slate-300">
    <p>{aboutCopy}</p>
  </section>
)

export default function App() {
  const { dataset, updateTeams, updateConstants, resetConstants, updateAsOf, saveSnapshot, history, setDataset } = useDataset()

  const [isTeamModalOpen, setTeamModalOpen] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const [isDrilldownOpen, setDrilldownOpen] = useState(false)
  const [isAboutOpen, setAboutOpen] = useState(false)
  const [drilldownTeam, setDrilldownTeam] = useState<TeamWithKPIs | null>(null)
  const [importMode, setImportMode] = useState<'csv' | 'json' | 'any'>('any')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const teamsWithKPIs = useMemo(() => computeTeamsWithKPIs(dataset), [dataset])

  const triggerFilePicker = (mode: 'csv' | 'json') => {
    setImportMode(mode)
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const teams = await importTeamsFromFile(file)
      updateTeams(teams)
      updateAsOf(dayjs().toISOString())
      setTeamModalOpen(true)
    } catch (error) {
      console.error('Import failed', error)
    } finally {
      event.target.value = ''
    }
  }

  const handleDrilldown = (team: TeamWithKPIs) => {
    setDrilldownTeam(team)
    setDrilldownOpen(true)
  }

  const handleExportJSON = () => exportDatasetJSON(dataset)
  const handleExportCSV = () => exportTeamsCSV(dataset.teams)

  const handleNewUpdate = () => {
    updateAsOf(dayjs().toISOString())
    setTeamModalOpen(true)
  }

  const handleLoadDemo = () => {
    setDataset(DEMO_DATA)
    setTeamModalOpen(false)
  }

  const acceptAttr = importMode === 'csv' ? '.csv,text/csv' : importMode === 'json' ? '.json,application/json' : '.csv,.json,application/json,text/csv'

  return (
    <>
      <input ref={fileInputRef} type="file" accept={acceptAttr} className="hidden" onChange={handleFileChange} />
      <AppShell
        onEditTeams={() => setTeamModalOpen(true)}
        onImportCSV={() => triggerFilePicker('csv')}
        onImportJSON={() => triggerFilePicker('json')}
        onOpenSettings={() => setSettingsOpen(true)}
        onExportDataset={handleExportJSON}
        onNewUpdate={handleNewUpdate}
        onOpenAbout={() => setAboutOpen(true)}
        lastUpdated={dataset.asOf}
      >
        <div className="flex flex-col gap-8">
          <SummaryTiles dataset={dataset} teams={teamsWithKPIs} />
          <TeamsComparisonGrid teams={teamsWithKPIs} constants={dataset.constants} dataset={dataset} onDrillDown={handleDrilldown} />
          <TeamCharts teams={teamsWithKPIs} />
          <ProjectionView dataset={dataset} teams={teamsWithKPIs} constants={dataset.constants} history={history} />
          <AccelerationPage constants={dataset.constants} />
        </div>

        <Modal open={isTeamModalOpen} onClose={() => setTeamModalOpen(false)} title="Edit teams" description="Paste or import data, then save changes." size="xl">
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
              <p>
                CSV header: <code className="rounded bg-slate-800 px-2 py-1">name,steps,activityKm,missions,quizzes,photos,teamPoints,boostActiveCount</code>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs uppercase tracking-wide text-sky-200" onClick={handleLoadDemo}>
                  Load demo data
                </button>
                <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-wide text-emerald-200" onClick={handleExportCSV}>
                  Export CSV
                </button>
                <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-wide text-emerald-200" onClick={handleExportJSON}>
                  Export JSON
                </button>
                <button className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs uppercase tracking-wide text-purple-200" onClick={saveSnapshot}>
                  Save snapshot
                </button>
              </div>
            </div>
            <TeamForm teams={dataset.teams} onChange={updateTeams} />
            <div className="flex flex-wrap justify-end gap-2">
              <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200" onClick={() => updateAsOf(dayjs().toISOString())}>
                Save to localStorage
              </button>
              <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300" onClick={() => setTeamModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>

        <Modal open={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Settings" description="Adjust constants to align with your app payouts." size="lg">
          <SettingsForm constants={dataset.constants} onChange={updateConstants} onReset={resetConstants} />
        </Modal>

        <Modal open={isDrilldownOpen && drilldownTeam !== null} onClose={() => setDrilldownOpen(false)} title={drilldownTeam?.name ?? 'Team drilldown'} description="Detailed KPIs, formulas, and history." size="lg">
          {drilldownTeam ? <DrilldownContent team={drilldownTeam} history={history} /> : null}
        </Modal>

        <Modal open={isAboutOpen} onClose={() => setAboutOpen(false)} title="About Squad Analytics" size="md">
          <AboutContent />
        </Modal>
      </AppShell>
    </>
  )
}

