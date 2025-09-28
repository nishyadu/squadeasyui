type ProjectionControlsProps = {
  endDate: string
  onEndDateChange: (value: string) => void
  lookback: number
  onLookbackChange: (value: number) => void
  showEstimates: boolean
  onToggleEstimates: (value: boolean) => void
  minDate: string
  daysRemaining: number
}

const LOOKBACK_OPTIONS = [3, 5, 7] as const

export const ProjectionControls = ({ endDate, onEndDateChange, lookback, onLookbackChange, showEstimates, onToggleEstimates, minDate, daysRemaining }: ProjectionControlsProps) => {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 text-sm text-slate-200">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-white">Projection controls</h3>
        <p className="text-xs text-slate-400">Choose the horizon and lookback window. Projections update instantly.</p>
      </header>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">End date</span>
          <input type="date" value={endDate} min={minDate} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" onChange={(event) => onEndDateChange(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Lookback (days)</span>
          <select value={lookback} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" onChange={(event) => onLookbackChange(Number(event.target.value))}>
            {LOOKBACK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} days
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
          <input type="checkbox" checked={showEstimates} onChange={(event) => onToggleEstimates(event.target.checked)} className="h-4 w-4 rounded border-white/10 bg-slate-950" />
          Show estimated points markers
        </label>
        {daysRemaining === 0 ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Challenge ended
          </span>
        ) : null}
      </div>
    </section>
  )
}

