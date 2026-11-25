import type { ExternalRefs } from '../contracts/ideark'
import type { QaReport } from '../site/qa'
import type { SiteContent } from '../site/model'

export const STATUSES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'pendiente_informacion', label: 'Pendiente de información' },
  { id: 'preparacion', label: 'Preparación' },
  { id: 'en_produccion', label: 'En producción' },
  { id: 'revision_interna', label: 'Revisión interna' },
  { id: 'pendiente_aprobacion', label: 'Pendiente de aprobación' },
  { id: 'correcciones', label: 'Correcciones' },
  { id: 'aprobado', label: 'Aprobado' },
  { id: 'preparado_entrega', label: 'Preparado para entrega' },
  { id: 'entregado', label: 'Entregado' },
  { id: 'en_mantenimiento', label: 'En mantenimiento' },
] as const

export type ProjectStatus = (typeof STATUSES)[number]['id']

export const DELIVERY_STATUSES: ProjectStatus[] = ['preparado_entrega', 'entregado']

export type HistoryEvent = { id: string; at: string; message: string }

export type Incident = {
  id: string
  title: string
  detail: string
  severity: 'baja' | 'media' | 'alta'
  status: 'abierta' | 'resuelta'
  createdAt: string
  resolvedAt: string | null
}

export type ExportRecord = { id: string; at: string; fileName: string; bytes: number }

export type ProjectTime = {
  creationMs: number
  customizationMs: number
  reviewMs: number
  exportMs: number
}

export type Project = {
  id: string
  code: string
  name: string
  client: string
  sector: string
  product: 'web'
  templateId: string
  owner: string
  status: ProjectStatus
  createdAt: string
  dueDate: string
  updatedAt: string
  contentRevision: number
  content: SiteContent
  history: HistoryEvent[]
  incidents: Incident[]
  qa: QaReport | null
  exports: ExportRecord[]
  time: ProjectTime
  estimateMinutes: number | null
  external: ExternalRefs
  demo: boolean
}

export type StudioState = {
  ready: boolean
  corrupt: boolean
  corruptRaw: string | null
  persistError: string | null
  projects: Project[]
  theme: 'dark' | 'light'
}

export type TimeBucket = keyof ProjectTime

export const STORAGE_KEY = 'ideark.studio.v1'

export function statusLabel(status: ProjectStatus): string {
  return STATUSES.find((item) => item.id === status)?.label ?? status
}

export function emptyTime(): ProjectTime {
  return { creationMs: 0, customizationMs: 0, reviewMs: 0, exportMs: 0 }
}

export function emptyExternal(): ExternalRefs {
  return { comercial: '', experience: '', central: '', radar: '' }
}
