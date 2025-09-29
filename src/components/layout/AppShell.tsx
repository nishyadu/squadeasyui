import { InformationCircleIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { useState, type ReactNode } from 'react'

import type { SupabaseStatus } from '../../services/supabaseClient.ts'

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
  supabaseStatus: SupabaseStatus
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
  supabaseStatus,
}: AppShellProps) => {
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)

  const renderLastUpdated = () =>
    lastUpdated ? (
      <span className="rounded-full border border-white/10 bg-slate-800/60 px-3 py-1 text-slate-300">
        As of <time dateTime={lastUpdated}>{new Date(lastUpdated).toLocaleString()}</time>
      </span>
    ) : (
      <span className="rounded-full border border-white/5 bg-slate-800/60 px-3 py-1 text-slate-400">No data yet</span>
    )

  const actions = [
    {
      label: 'Import CSV',
      onClick: onImportCSV,
      className: 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20',
    },
    {
      label: 'Import JSON',
      onClick: onImportJSON,
      className: 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20',
    },
    {
      label: 'Edit teams',
      onClick: onEditTeams,
      className: 'rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10',
    },
    {
      label: 'Settings',
      onClick: onOpenSettings,
      className: 'rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10',
    },
    {
      label: 'Export',
      onClick: onExportDataset,
      className: 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/20',
    },
    {
      label: 'New morning update',
      onClick: onNewUpdate,
      className: 'rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-300 transition hover:bg-sky-500/20',
    },
    {
      label: 'About',
      onClick: onOpenAbout,
      className: 'rounded-md border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10',
    },
  ]

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
          <div className="w-full space-y-3 text-sm sm:w-auto sm:space-y-0">
            <div className="sm:hidden">
              <div className="flex items-center justify-between gap-2">
                <div>{renderLastUpdated()}</div>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 transition hover:bg-white/10"
                  onClick={() => setMobileActionsOpen((prev) => !prev)}
                >
                  {mobileActionsOpen ? 'Close' : 'Actions'}
                </button>
              </div>
              {mobileActionsOpen ? (
                <div className="mt-3 grid gap-2">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={`${action.className} w-full justify-center`}
                      onClick={() => {
                        action.onClick()
                        setMobileActionsOpen(false)
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {renderLastUpdated()}
              <StatusBadge status={supabaseStatus} />
              {actions.map((action) => (
                <button key={action.label} type="button" className={action.className} onClick={action.onClick}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}

const StatusBadge = ({ status }: { status: SupabaseStatus }) => {
  const tone =
    status.state === 'connected'
      ? 'bg-emerald-500'
      : status.state === 'error'
        ? 'bg-rose-500'
        : 'bg-amber-500'
  const label = status.state === 'connected' ? 'Connected to Supabase' : status.state === 'checking' ? 'Checking Supabase…' : 'Supabase not connected'

  return (
    <span title={status.details} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/60 px-3 py-1 text-xs text-slate-200">
      <span className={`h-2 w-2 rounded-full ${tone}`} aria-hidden />
      <span>{label}</span>
      {status.state === 'error' ? <InformationCircleIcon className="h-4 w-4 text-amber-300" aria-hidden /> : null}
    </span>
  )
}

