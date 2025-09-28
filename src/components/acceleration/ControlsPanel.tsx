type ControlsPanelProps = {
  lookback: number
  onLookbackChange: (value: number) => void
  useEMA: boolean
  onToggleEMA: (value: boolean) => void
  alphaVelocity: number
  onAlphaVelocityChange: (value: number) => void
  alphaAcceleration: number
  onAlphaAccelerationChange: (value: number) => void
  onExportCSV: () => void
  onExportPNG: () => void
}

const LOOKBACK_OPTIONS = [7, 14, 30] as const

export const ControlsPanel = ({
  lookback,
  onLookbackChange,
  useEMA,
  onToggleEMA,
  alphaVelocity,
  onAlphaVelocityChange,
  alphaAcceleration,
  onAlphaAccelerationChange,
  onExportCSV,
  onExportPNG,
}: ControlsPanelProps) => {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 text-sm text-slate-200">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-white">Acceleration controls</h3>
        <p className="text-xs text-slate-400">EMA smoothing: “Exponential moving average to reduce noise in daily gains/acceleration.”</p>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Lookback</span>
          <select value={lookback} onChange={(event) => onLookbackChange(Number(event.target.value))} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white">
            {LOOKBACK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} days
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs uppercase tracking-wide text-slate-400">
          <input type="checkbox" className="h-4 w-4 rounded border-white/10" checked={useEMA} onChange={(event) => onToggleEMA(event.target.checked)} />
          Use EMA smoothing
        </label>
        <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
            α velocity ({alphaVelocity.toFixed(1)})
            <input type="range" min={0.2} max={0.8} step={0.1} value={alphaVelocity} onChange={(event) => onAlphaVelocityChange(Number(event.target.value))} />
          </label>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
            α acceleration ({alphaAcceleration.toFixed(1)})
            <input type="range" min={0.2} max={0.8} step={0.1} value={alphaAcceleration} onChange={(event) => onAlphaAccelerationChange(Number(event.target.value))} />
          </label>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 bg-slate-950 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
          <input type="checkbox" className="h-4 w-4 rounded border-white/10" disabled />
          Normalize by team size (coming soon)
        </label>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10" onClick={onExportCSV}>
            Export CSV
          </button>
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10" onClick={onExportPNG}>
            Export PNG
          </button>
        </div>
      </div>
    </section>
  )
}

