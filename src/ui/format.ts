export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

export function formatDay(value: string): string {
  if (!value) return 'Sin fecha'
  const iso = value.length === 10 ? `${value}T12:00:00Z` : value
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0 s'
  if (ms < 1000) return `${Math.round(ms)} ms`
  const total = Math.round(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours) return minutes ? `${hours} h ${minutes} min` : `${hours} h`
  if (minutes) return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`
  return `${seconds} s`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', hourCycle: 'h23' }).format(now),
  )
  if (hour < 7) return 'La fábrica, de noche'
  if (hour < 14) return 'La fábrica, por la mañana'
  if (hour < 21) return 'La fábrica, por la tarde'
  return 'La fábrica, de noche'
}
