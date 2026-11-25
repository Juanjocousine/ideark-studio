import type { IdearkSystemId } from '../contracts/ideark'
import { getTemplate } from '../site/registry'
import type { QaReport } from '../site/qa'
import type { SiteContent } from '../site/model'
import { canUseStatus, statusChangeMessage } from './metrics'
import { createDemoProjects } from './seed'
import {
  STORAGE_KEY,
  emptyExternal,
  emptyTime,
  type ExportRecord,
  type Incident,
  type Project,
  type ProjectStatus,
  type StudioState,
  type TimeBucket,
} from './types'

export type KeyValueStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

type Persisted = { version: 1; projects: Project[]; ui: { theme: 'dark' | 'light' } }

export type CreateProjectInput = {
  name: string
  client: string
  sector: string
  owner: string
  dueDate: string
  templateId: string
  demo?: boolean
  creationMs?: number
}

export type StudioStore = {
  getState: () => StudioState
  subscribe: (listener: () => void) => () => void
  flush: () => void
  createProject: (input: CreateProjectInput) => Project
  updateDetails: (id: string, patch: Partial<Pick<Project, 'name' | 'client' | 'sector' | 'owner' | 'dueDate' | 'demo' | 'estimateMinutes'>>) => void
  updateContent: (id: string, content: SiteContent, note?: string) => void
  changeTemplate: (id: string, templateId: string) => void
  duplicateProject: (id: string) => Project | null
  deleteProject: (id: string) => void
  setStatus: (id: string, status: ProjectStatus) => { ok: true } | { ok: false; reason: string }
  addIncident: (id: string, input: Pick<Incident, 'title' | 'detail' | 'severity'>) => void
  resolveIncident: (id: string, incidentId: string) => void
  recordQa: (id: string, report: QaReport) => void
  recordExport: (id: string, record: Pick<ExportRecord, 'fileName' | 'bytes'>) => void
  addTime: (id: string, bucket: TimeBucket, ms: number) => void
  setExternal: (id: string, system: IdearkSystemId, value: string) => void
  setTheme: (theme: 'dark' | 'light') => void
  resetAndSeed: () => void
  restoreDemos: () => number
  exportState: () => string
  importState: (raw: string) => { ok: true } | { ok: false; reason: string }
}

function nextCode(projects: Project[]): string {
  const numbers = projects.map((project) => {
    const match = /^WEB-(\d+)$/.exec(project.code)
    return match ? Number(match[1]) : 1000
  })
  return `WEB-${Math.max(1000, ...numbers) + 1}`
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false
  const project = value as Partial<Project>
  return typeof project.id === 'string' && typeof project.code === 'string' && typeof project.templateId === 'string' && Boolean(project.content)
}

export function createStudioStore(options: {
  storage: KeyValueStorage
  now?: () => string
  id?: () => string
}): StudioStore {
  const now = options.now ?? (() => new Date().toISOString())
  let counter = 0
  const makeId = options.id ?? (() => {
    counter += 1
    return `${Math.random().toString(36).slice(2, 8)}${counter.toString(36)}`
  })
  const listeners = new Set<() => void>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let snapshot: StudioState = {
    ready: true,
    corrupt: false,
    corruptRaw: null,
    persistError: null,
    projects: [],
    theme: 'dark',
  }

  function serialize(): string {
    const payload: Persisted = { version: 1, projects: snapshot.projects, ui: { theme: snapshot.theme } }
    return JSON.stringify(payload)
  }

  function writeNow() {
    if (snapshot.corrupt) return
    const previous = snapshot.persistError
    try {
      options.storage.setItem(STORAGE_KEY, serialize())
      if (previous) {
        snapshot = { ...snapshot, persistError: null }
        emit()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo escribir'
      snapshot = { ...snapshot, persistError: `No se pudo guardar en este navegador (${message}). Descarga una copia.` }
      if (snapshot.persistError !== previous) emit()
    }
  }

  function emit() {
    listeners.forEach((listener) => listener())
  }

  function commit(next: StudioState, immediate = false) {
    snapshot = next
    if (timer) clearTimeout(timer)
    if (immediate) writeNow()
    else timer = setTimeout(writeNow, 200)
    emit()
  }

  function load() {
    const raw = options.storage.getItem(STORAGE_KEY)
    if (!raw) {
      snapshot = { ...snapshot, projects: createDemoProjects(), theme: 'dark', corrupt: false, corruptRaw: null }
      writeNow()
      return
    }
    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>
      if (parsed.version !== 1 || !Array.isArray(parsed.projects) || parsed.projects.some((project) => !isProject(project))) {
        snapshot = { ...snapshot, corrupt: true, corruptRaw: raw, projects: [] }
        return
      }
      snapshot = {
        ...snapshot,
        corrupt: false,
        corruptRaw: null,
        projects: parsed.projects,
        theme: parsed.ui?.theme === 'light' ? 'light' : 'dark',
      }
    } catch {
      snapshot = { ...snapshot, corrupt: true, corruptRaw: raw, projects: [] }
    }
  }

  function patch(id: string, recipe: (project: Project) => Project) {
    const projects = snapshot.projects.map((project) => (project.id === id ? recipe(project) : project))
    commit({ ...snapshot, projects })
  }

  load()

  return {
    getState: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    flush() {
      if (timer) clearTimeout(timer)
      timer = null
      writeNow()
      emit()
    },
    createProject(input) {
      const template = getTemplate(input.templateId)
      const stamp = now()
      const project: Project = {
        id: `prj_${makeId()}`,
        code: nextCode(snapshot.projects),
        name: input.name.trim(),
        client: input.client.trim(),
        sector: input.sector.trim() || template.sector,
        product: 'web',
        templateId: template.id,
        owner: input.owner.trim(),
        status: 'nuevo',
        createdAt: stamp,
        dueDate: input.dueDate,
        updatedAt: stamp,
        contentRevision: 1,
        content: template.createContent(),
        history: [{ id: makeId(), at: stamp, message: `Proyecto creado con la plantilla ${template.name}.` }],
        incidents: [],
        qa: null,
        exports: [],
        time: { ...emptyTime(), creationMs: Math.max(0, input.creationMs ?? 0) },
        estimateMinutes: null,
        external: emptyExternal(),
        demo: Boolean(input.demo),
      }
      commit({ ...snapshot, projects: [project, ...snapshot.projects] }, true)
      return project
    },
    updateDetails(id, patchInput) {
      patch(id, (project) => ({
        ...project,
        ...patchInput,
        name: patchInput.name !== undefined ? patchInput.name.trim() : project.name,
        updatedAt: now(),
      }))
    },
    updateContent(id, content, note) {
      const stamp = now()
      patch(id, (project) => ({
        ...project,
        content,
        contentRevision: project.contentRevision + 1,
        updatedAt: stamp,
        history: note ? [{ id: makeId(), at: stamp, message: note }, ...project.history] : project.history,
      }))
    },
    changeTemplate(id, templateId) {
      const template = getTemplate(templateId)
      const stamp = now()
      patch(id, (project) => {
        const fresh = template.createContent()
        fresh.brandName = project.content.brandName || fresh.brandName
        fresh.logoText = project.content.logoText || fresh.logoText
        fresh.phone = project.content.phone || fresh.phone
        fresh.whatsapp = project.content.whatsapp || fresh.whatsapp
        fresh.email = project.content.email || fresh.email
        fresh.address = project.content.address || fresh.address
        fresh.city = project.content.city || fresh.city
        fresh.postalCode = project.content.postalCode || fresh.postalCode
        return {
          ...project,
          templateId: template.id,
          sector: project.sector || template.sector,
          content: fresh,
          contentRevision: project.contentRevision + 1,
          updatedAt: stamp,
          history: [{ id: makeId(), at: stamp, message: `Plantilla cambiada a ${template.name}. Se conservan nombre y contacto.` }, ...project.history],
        }
      })
    },
    duplicateProject(id) {
      const source = snapshot.projects.find((project) => project.id === id)
      if (!source) return null
      const stamp = now()
      const copy: Project = {
        ...structuredClone(source),
        id: `prj_${makeId()}`,
        code: nextCode(snapshot.projects),
        name: `Copia de ${source.name}`,
        status: 'nuevo',
        createdAt: stamp,
        updatedAt: stamp,
        contentRevision: 1,
        qa: null,
        exports: [],
        time: emptyTime(),
        history: [{ id: makeId(), at: stamp, message: `Duplicado desde ${source.code}.` }],
        incidents: source.incidents.map((incident) => ({ ...incident, id: makeId() })),
      }
      commit({ ...snapshot, projects: [copy, ...snapshot.projects] }, true)
      return copy
    },
    deleteProject(id) {
      commit({ ...snapshot, projects: snapshot.projects.filter((project) => project.id !== id) }, true)
    },
    setStatus(id, status) {
      const project = snapshot.projects.find((item) => item.id === id)
      if (!project) return { ok: false, reason: 'El proyecto no existe.' }
      if (project.status === status) return { ok: true }
      const reason = canUseStatus(project, status)
      if (reason) return { ok: false, reason }
      const stamp = now()
      patch(id, (current) => ({
        ...current,
        status,
        updatedAt: stamp,
        history: [{ id: makeId(), at: stamp, message: statusChangeMessage(current.status, status) }, ...current.history],
      }))
      return { ok: true }
    },
    addIncident(id, input) {
      const stamp = now()
      const incident: Incident = {
        id: makeId(),
        title: input.title.trim(),
        detail: input.detail.trim(),
        severity: input.severity,
        status: 'abierta',
        createdAt: stamp,
        resolvedAt: null,
      }
      patch(id, (project) => ({
        ...project,
        updatedAt: stamp,
        incidents: [incident, ...project.incidents],
        history: [{ id: makeId(), at: stamp, message: `Incidencia abierta: ${incident.title}.` }, ...project.history],
      }))
    },
    resolveIncident(id, incidentId) {
      const stamp = now()
      patch(id, (project) => ({
        ...project,
        updatedAt: stamp,
        incidents: project.incidents.map((incident) =>
          incident.id === incidentId ? { ...incident, status: 'resuelta', resolvedAt: stamp } : incident,
        ),
        history: [{ id: makeId(), at: stamp, message: 'Incidencia resuelta.' }, ...project.history],
      }))
    },
    recordQa(id, report) {
      const stamp = now()
      patch(id, (project) => ({
        ...project,
        qa: report,
        updatedAt: stamp,
        history: [
          {
            id: makeId(),
            at: stamp,
            message: report.passed
              ? `Control de calidad superado, con ${report.summary.warning} advertencias.`
              : `Control de calidad con ${report.summary.error} errores y ${report.summary.blocker} bloqueadores.`,
          },
          ...project.history,
        ],
      }))
    },
    recordExport(id, record) {
      const stamp = now()
      patch(id, (project) => ({
        ...project,
        updatedAt: stamp,
        exports: [{ id: makeId(), at: stamp, fileName: record.fileName, bytes: record.bytes }, ...project.exports],
        history: [{ id: makeId(), at: stamp, message: `Exportación ZIP: ${record.fileName}.` }, ...project.history],
      }))
    },
    addTime(id, bucket, ms) {
      if (!Number.isFinite(ms) || ms <= 0) return
      const projects = snapshot.projects.map((project) =>
        project.id === id ? { ...project, time: { ...project.time, [bucket]: project.time[bucket] + Math.round(ms) } } : project,
      )
      commit({ ...snapshot, projects })
    },
    setExternal(id, system, value) {
      const stamp = now()
      patch(id, (project) => ({
        ...project,
        updatedAt: stamp,
        external: { ...project.external, [system]: value.trim() },
      }))
    },
    setTheme(theme) {
      commit({ ...snapshot, theme })
    },
    resetAndSeed() {
      if (timer) clearTimeout(timer)
      snapshot = {
        ready: true,
        corrupt: false,
        corruptRaw: null,
        persistError: null,
        projects: createDemoProjects(),
        theme: snapshot.theme,
      }
      writeNow()
      emit()
    },
    restoreDemos() {
      const existing = new Set(snapshot.projects.map((project) => project.id))
      const missing = createDemoProjects().filter((project) => !existing.has(project.id))
      if (!missing.length) return 0
      commit({ ...snapshot, projects: [...missing, ...snapshot.projects] }, true)
      return missing.length
    },
    exportState: () => serialize(),
    importState(raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Persisted>
        if (parsed.version !== 1 || !Array.isArray(parsed.projects) || parsed.projects.some((project) => !isProject(project))) {
          return { ok: false, reason: 'La copia no tiene el formato de Ideark Studio 1.0.' }
        }
        commit(
          {
            ...snapshot,
            corrupt: false,
            corruptRaw: null,
            projects: parsed.projects,
            theme: parsed.ui?.theme === 'light' ? 'light' : snapshot.theme,
          },
          true,
        )
        return { ok: true }
      } catch {
        return { ok: false, reason: 'No se ha podido leer el archivo.' }
      }
    },
  }
}
