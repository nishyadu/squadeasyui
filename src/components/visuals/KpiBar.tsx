import classNames from 'classnames'

type KpiBarProps = {
  value: number
  max: number
  label: string
  tone?: 'good' | 'watch' | 'fix' | 'neutral'
  markers?: number[]
  target?: number
}

const toneClasses: Record<Required<KpiBarProps>['tone'], string> = {
  good: 'bg-emerald-500',
  watch: 'bg-amber-500',
  fix: 'bg-rose-500',
  neutral: 'bg-slate-500',
}

export const KpiBar = ({ value, max, label, tone = 'neutral', markers = [], target }: KpiBarProps) => {
  const percent = Math.min(Math.max(value / max, 0), 1)

  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-2 w-full rounded-full bg-slate-800">
        <span className={classNames('absolute inset-y-0 left-0 rounded-full', toneClasses[tone])} style={{ width: `${percent * 100}%` }} aria-hidden />
        {markers.map((marker) => (
          <span key={marker} className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 bg-white/60" style={{ left: `${(marker / max) * 100}%` }} aria-hidden />
        ))}
        {target ? (
          <span className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 bg-sky-400" style={{ left: `${(target / max) * 100}%` }} aria-hidden />
        ) : null}
      </div>
      <span className="text-xs text-slate-300">{label}</span>
    </div>
  )
}

