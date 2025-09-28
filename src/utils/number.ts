export const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

export const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export const safeDivide = (numerator: number, denominator: number): number => {
  if (denominator === 0) {
    return Number.POSITIVE_INFINITY
  }
  return numerator / denominator
}

