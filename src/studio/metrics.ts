import { DELIVERY_STATUSES, STATUSES, statusLabel, type Project, type ProjectStatus } from './types'

export function deliveryBlockReason(project: Project): string | null {
  if (!project.qa) return 'Ejecuta el control de calidad antes de preparar la entrega.'
  if (project.qa.contentRevision !== project.contentRevision) {
    return 'El informe es anterior a los últimos cambios. Vuelve a ejecutar el control de calidad.'
  }
  if (project.qa.summary.blocker > 0) return 'Hay bloqueadores en el informe de calidad.'
  if (project.qa.summary.error > 0) return 'Hay errores en el informe de calidad.'
  return null
}

export function canUseStatus(project: Project, status: ProjectStatus): string | null {
  if (!DELIVERY_STATUSES.includes(status)) return null
  return deliveryBlockReason(project)
}

export function measuredMs(project: Project): number {
  return project.time.creationMs + project.time.customizationMs + project.time.reviewMs + project.time.exportMs
}

export function madridDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isOverdue(project: Project, now = new Date()): boolean {
  if (project.status === 'entregado') return false
  return Boolean(project.dueDate) && project.dueDate < madridDate(now)
}

export function productionSummary(projects: Project[]) {
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status.id, 0])) as Record<ProjectStatus, number>
  for (const project of projects) byStatus[project.status] += 1
  const openIncidents = projects.flatMap((project) =>
    project.incidents
      .filter((incident) => incident.status === 'abierta')
      .map((incident) => ({ ...incident, projectId: project.id, projectName: project.name, code: project.code })),
  )
  const recent = projects
    .flatMap((project) =>
      project.history.map((event) => ({
        ...event,
        projectId: project.id,
        projectName: project.name,
        code: project.code,
      })),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10)
  return {
    total: projects.length,
    active: projects.filter((project) => project.status !== 'entregado').length,
    pendingInfo: byStatus.pendiente_informacion,
    inProduction: byStatus.en_produccion,
    inReview: byStatus.revision_interna,
    pendingApproval: byStatus.pendiente_aprobacion,
    ready: byStatus.preparado_entrega,
    delivered: byStatus.entregado,
    byStatus,
    openIncidents,
    measuredMs: projects.reduce((sum, project) => sum + measuredMs(project), 0),
    recent,
  }
}

export function statusChangeMessage(from: ProjectStatus, to: ProjectStatus): string {
  return `Estado: ${statusLabel(from)} → ${statusLabel(to)}.`
}
