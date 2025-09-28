import { Squares2X2Icon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  onEditTeams: () => void
  onImportCSV: () => void
  onImportJSON: () => void
  onOpenSettings: () => void
  onExportDataset: () => void
  onNewUpdate: () => void
  onOpenAbout: () => void
  lastUpdated?: string
}

export const AppShell = ({
  children,
  onEditTeams,
  onImportCSV,
  onImportJSON,
  onOpenSettings,
  onExportDataset,
  onNewUpdate,
  onOpenAbout,
  lastUpdated,
}: AppShellProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-y-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
              <Squares2X2Icon aria-hidden className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl" aria-label="Squad Analytics dashboard">
                Squad Analytics
              </h1>
              <p className="text-sm text-slate-400">Comparisons, insights, and coaching for every team.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {lastUpdated ? (
              <span className="rounded-full border border-white/10 bg-slate-800/60 px-3 py-1 text-slate-300">
                As of <time dateTime={lastUpdated}>{new Date(lastUpdated).toLocaleString()}</time>
              </span>
            ) : (
              <span className="rounded-full border border-white/5 bg-slate-800/60 px-3 py-1 text-slate-400">No data yet</span>
            )}
            <button className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20" onClick={onImportCSV}>
              Import CSV
            </button>
            <button className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20" onClick={onImportJSON}>
              Import JSON
            </button>
            <button className="rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10" onClick={onEditTeams}>
              Edit teams
            </button>
            <button className="rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10" onClick={onOpenSettings}>
              Settings
            </button>
            <button className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20" onClick={onExportDataset}>
              Export
            </button>
            <button className="rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-300 transition hover:bg-sky-500/20" onClick={onNewUpdate}>
              New morning update
            </button>
            <button className="rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10" onClick={onOpenAbout}>
              About
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}

