import classNames from 'classnames'

type PillProps = {
  label: string
  tone?: 'good' | 'watch' | 'fix' | 'neutral'
  tooltip?: string
}

const toneClasses: Record<NonNullable<PillProps['tone']>, string> = {
  good: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  watch: 'bg-amber-500/10 text-amber-200 border border-amber-500/20',
  fix: 'bg-rose-500/10 text-rose-200 border border-rose-500/20',
  neutral: 'bg-slate-800/80 text-slate-300 border border-white/10',
}

export const Pill = ({ label, tone = 'neutral', tooltip }: PillProps) => (
  <span className={classNames('inline-flex items-center rounded-full px-3 py-1 text-xs', toneClasses[tone])} title={tooltip}>
    {label}
  </span>
)

