export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) =>
  Number.isFinite(value) ? value.toLocaleString(undefined, options) : '—'

export const formatPercent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`

export const formatDateTime = (value: string) => new Date(value).toLocaleString()

export const fmtInt = (value: number) => formatNumber(value)
export const fmt1 = (value: number) => formatNumber(value, { maximumFractionDigits: 1, minimumFractionDigits: 1 })
export const fmt2 = (value: number) => formatNumber(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

