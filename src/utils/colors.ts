const NAMED_COLORS: Record<string, string> = {
  'Les Sportifs': '#22c55e',
  League: '#ef4444',
  Dreamers: '#38bdf8',
}

const FALLBACK_COLORS = ['#a855f7', '#f97316', '#14b8a6', '#facc15', '#e11d48', '#6366f1', '#0ea5e9', '#ec4899']

export const getTeamColor = (name: string, index: number): string => {
  if (NAMED_COLORS[name]) {
    return NAMED_COLORS[name]
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export const getTeamColorMap = (teams: string[]): Map<string, string> => {
  const map = new Map<string, string>()
  teams.forEach((name, index) => {
    map.set(name, getTeamColor(name, index))
  })
  return map
}

