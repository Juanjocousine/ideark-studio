import { Link } from 'react-router-dom'
import { STATUSES, statusLabel } from '../../studio/types'
import { isOverdue, productionSummary } from '../../studio/metrics'
import { useStudio } from '../../studio/Studio'
import { formatDuration, formatDay, formatWhen, greeting } from '../format'
import { EmptyState, Stamp, StatusPill } from '../kit'
import { useTitle } from '../useTitle'

export function DashboardPage() {
  useTitle('Panel')
  const { projects } = useStudio()
  const summary = productionSummary(projects)
  const spotlight = projects.filter((project) => project.status !== 'entregado').slice(0, 6)

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Ideark Studio · datos locales</p>
        <h1 className="title">{greeting()}</h1>
        <p className="lead">
          Aquí se produce la web, no se vende ni se contabiliza. Los proyectos marcados como demostración usan clientes ficticios.
        </p>
      </header>

      <section className="metrics" aria-label="Resumen">
        <article><span>Activos</span><b>{summary.active}</b><small>Sin contar los entregados</small></article>
        <article><span>Pendientes de información</span><b>{summary.pendingInfo}</b><small>Falta contenido del cliente</small></article>
        <article><span>En producción</span><b>{summary.inProduction}</b><small>Se está personalizando</small></article>
        <article><span>En revisión</span><b>{summary.inReview}</b><small>Revisión interna</small></article>
        <article><span>Pendientes de aprobación</span><b>{summary.pendingApproval}</b><small>Esperan decisión</small></article>
        <article><span>Preparados para entrega</span><b>{summary.ready}</b><small>Sin publicación automática</small></article>
        <article><span>Entregados</span><b>{summary.delivered}</b><small>Cerrados en Studio</small></article>
        <article><span>Incidencias</span><b>{summary.openIncidents.length}</b><small>Abiertas ahora</small></article>
        <article className="metric-wide"><span>Tiempo de producción medido</span><b>{formatDuration(summary.measuredMs)}</b><small>Creación, editor, revisión y exportación. No es una estimación.</small></article>
      </section>

      <section>
        <h2>Flujo</h2>
        <div className="pipeline">
          {STATUSES.map((status) => (
            <Link key={status.id} to={`/proyectos?estado=${status.id}`} className="node">
              <strong>{summary.byStatus[status.id]}</strong>
              <span>{status.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="split">
        <section className="panel">
          <header className="panel-head">
            <h2>En curso</h2>
            <Link to="/proyectos">Ver todos</Link>
          </header>
          {spotlight.length === 0 ? (
            <EmptyState title="No hay proyectos" text="La galería tiene seis plantillas listas para abrir un encargo." action={<Link to="/galeria">Ir a la galería</Link>} />
          ) : (
            <div className="project-list">
              {spotlight.map((project) => (
                <Link key={project.id} to={`/proyectos/${project.id}`} className="project-row">
                  <span className="code">{project.code}</span>
                  <span>
                    <strong>{project.name}</strong>
                    <small>{project.client}</small>
                  </span>
                  <StatusPill status={project.status} />
                  {project.demo ? <Stamp /> : null}
                  <em className={isOverdue(project) ? 'over' : ''}>{formatDay(project.dueDate)}</em>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Actividad reciente</h2>
          {summary.recent.length === 0 ? (
            <EmptyState title="Sin actividad" text="Los cambios de estado, la calidad y las exportaciones aparecerán aquí." />
          ) : (
            <ol className="activity">
              {summary.recent.map((event) => (
                <li key={event.id}>
                  <Link to={`/proyectos/${event.projectId}`}>{event.code}</Link>
                  <p>{event.message}</p>
                  <time dateTime={event.at}>{formatWhen(event.at)}</time>
                </li>
              ))}
            </ol>
          )}
          <h2>Incidencias abiertas</h2>
          {summary.openIncidents.length === 0 ? <p className="muted">No hay incidencias abiertas.</p> : (
            <ul className="incident-list">
              {summary.openIncidents.map((incident) => (
                <li key={incident.id}>
                  <Link to={`/proyectos/${incident.projectId}`}>{incident.projectName}</Link>
                  <strong>{incident.title}</strong>
                  <small>{incident.detail}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <p className="footnote">Estado mostrado con la etiqueta «{statusLabel('en_produccion')}» y el resto del flujo. Nada se publica fuera de este equipo.</p>
    </div>
  )
}
