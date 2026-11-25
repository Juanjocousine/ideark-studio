import { normalizeHex } from './model'

function channel(hex: string, offset: number): number {
  return Number.parseInt(hex.slice(offset, offset + 2), 16)
}

function linear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const normal = normalizeHex(hex) ?? '#000000'
  const red = linear(channel(normal, 1))
  const green = linear(channel(normal, 3))
  const blue = linear(channel(normal, 5))
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(a: string, b: string): number {
  const left = luminance(a)
  const right = luminance(b)
  const lighter = Math.max(left, right)
  const darker = Math.min(left, right)
  return (lighter + 0.05) / (darker + 0.05)
}

export function onAccent(accent: string): string {
  const white = contrastRatio('#ffffff', accent)
  const ink = contrastRatio('#161513', accent)
  return white >= ink ? '#ffffff' : '#161513'
}
