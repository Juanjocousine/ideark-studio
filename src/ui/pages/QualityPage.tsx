import { Link, useParams } from 'react-router-dom'
import { packageSite } from '../../site/render'
import { runQa, type QaReport } from '../../site/qa'
import { downloadBlob } from '../../site/zip'
import { useMeasuredTime, useStudio } from '../../studio/Studio'
import type { Project } from '../../studio/types'
import { formatDuration, formatWhen } from '../format'
import { EmptyState, Notice } from '../kit'
import { useTitle } from '../useTitle'

function execute(project: Project): QaReport {
  const packed = packageSite(project.templateId, project.content)
  return runQa({
    projectId: project.id,
    content: project.content,
    html: packed.html,
    css: packed.css,
    js: packed.js,
    files: packed.files,
    contentRevision: project.contentRevision,
  })
}

export function QualityPage() {
  useTitle('Calidad')
  const { projects } = useStudio()
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Studio QA</p>
        <h1 className="title">Control de calidad</h1>
        <p className="lead">Revisa la web que se exportaría. Un error o un bloqueador impide marcar el proyecto como preparado para entrega.</p>
      </header>
      {projects.length === 0 ? <EmptyState title="No hay proyectos" text="Crea uno para poder revisar la calidad." action={<Link to="/galeria">Ir a la galería</Link>} /> : (
        <div className="cards">
          {projects.map((project) => {
            const stale = !project.qa || project.qa.contentRevision !== project.contentRevision
            return (
              <article key={project.id} className="card">
                <span className="code">{project.code}</span>
                <h2><Link to={`/calidad/${project.id}`}>{project.name}</Link></h2>
                {project.qa ? (
                  <p>{project.qa.passed ? 'Sin errores ni bloqueadores' : 'Con incidencias de calidad'} · {stale ? 'Informe desactualizado' : 'Informe al día'}</p>
                ) : <p>Sin informe.</p>}
                <Link to={`/calidad/${project.id}`}>Abrir informe</Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function QualityReportPage() {
  const { id } = useParams()
  const { projects, api } = useStudio()
  const project = projects.find((item) => item.id === id)
  useTitle(project ? `Calidad · ${project.name}` : 'Calidad')
  useMeasuredTime(project?.id, 'reviewMs')
  if (!project) return <div className="page"><EmptyState title="Proyecto no encontrado" text="No está en este navegador." action={<Link to="/calidad">Volver</Link>} /></div>

  const report = project.qa
  const stale = Boolean(report && report.contentRevision !== project.contentRevision)
  return (
    <div className="page">
      <p className="eyebrow"><Link to="/calidad">Calidad</Link> / {project.code}</p>
      <header className="page-head row-between">
        <div>
          <h1 className="title">{project.name}</h1>
          <p className="lead">Informe sobre la web exportable, no sobre una captura.</p>
        </div>
        <div className="row-actions">
          <button type="button" className="primary" onClick={() => api.recordQa(project.id, execute(project))}>
            {report ? 'Ejecutar de nuevo' : 'Ejecutar control'}
          </button>
          <Link to={`/proyectos/${project.id}/editor`}>Volver al editor</Link>
        </div>
      </header>
      {!report ? <EmptyState title="Todavía no hay informe" text="El control comprueba enlaces, imágenes, textos, metadatos, formularios, responsive, JavaScript y accesibilidad básica." /> : (
        <>
          {stale ? <Notice tone="warn">Este informe es anterior a los últimos cambios. Vuelve a ejecutarlo antes de preparar la entrega.</Notice> : null}
          <section className="qa-summary">
            <article><span>Correcto</span><b>{report.summary.ok}</b></article>
            <article><span>Advertencia</span><b>{report.summary.warning}</b></article>
            <article><span>Error</span><b>{report.summary.error}</b></article>
            <article><span>Bloqueador</span><b>{report.summary.blocker}</b></article>
            <article><span>Comprobación automática</span><b>{formatDuration(report.durationMs)}</b></article>
          </section>
          <p className={report.passed && !stale ? 'notice notice-info' : 'notice notice-warn'}>
            {report.passed ? 'No hay errores ni bloqueadores.' : 'Hay errores o bloqueadores. El proyecto no puede marcarse como preparado para entrega.'}
            {' '}Generado {formatWhen(report.createdAt)}.
          </p>
          <div className="row-actions">
            <button type="button" onClick={() => window.print()}>Imprimir informe</button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
                downloadBlob(blob, `${project.code}-calidad.json`)
              }}
            >
              Descargar JSON
            </button>
          </div>
          <ol className="checks">
            {report.checks.map((check) => (
              <li key={check.id} data-severity={check.severity}>
                <strong>{labelSeverity(check.severity)} · {check.title}</strong>
                <p>{check.detail}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

function labelSeverity(severity: QaReport['checks'][number]['severity']): string {
  if (severity === 'ok') return 'Correcto'
  if (severity === 'warning') return 'Advertencia'
  if (severity === 'error') return 'Error'
  return 'Bloqueador'
}
