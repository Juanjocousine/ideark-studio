import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IDEARK_SYSTEMS } from '../../contracts/ideark'
import type { SiteContent } from '../../site/model'
import { TEMPLATES, getTemplate } from '../../site/registry'
import { buildProjectZip, downloadBlob } from '../../site/zip'
import { deliveryBlockReason, isOverdue, measuredMs } from '../../studio/metrics'
import { useStudio } from '../../studio/Studio'
import { DELIVERY_STATUSES, STATUSES, type Incident, type Project, type ProjectStatus } from '../../studio/types'
import { formatBytes, formatDay, formatDuration, formatWhen } from '../format'
import { EmptyState, Field, Notice, Stamp, StatusPill, useConfirm } from '../kit'
import { useTitle } from '../useTitle'

function readableConfig(content: SiteContent): string {
  const clone = structuredClone(content)
  if (clone.logoImage) clone.logoImage = '[imagen]'
  if (clone.hero.image) clone.hero.image = '[imagen]'
  clone.gallery = clone.gallery.map((item) => ({ ...item, image: item.image ? '[imagen]' : '' }))
  return JSON.stringify(clone, null, 2)
}

export function ProjectPage() {
  const { id } = useParams()
  const { projects } = useStudio()
  const project = projects.find((item) => item.id === id)
  useTitle(project ? project.name : 'Proyecto')
  if (!project) return <div className="page"><EmptyState title="Proyecto no encontrado" text="Puede haberse eliminado en este navegador." action={<Link to="/proyectos">Volver a proyectos</Link>} /></div>
  return <ProjectDetail project={project} />
}

function ProjectDetail({ project }: { project: Project }) {
  const { api } = useStudio()
  const navigate = useNavigate()
  const { confirm, dialog } = useConfirm()
  const [statusError, setStatusError] = useState<string | null>(null)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [incident, setIncident] = useState({ title: '', detail: '', severity: 'media' as Incident['severity'] })
  let templateName = project.templateId
  try {
    templateName = getTemplate(project.templateId).name
  } catch {
    templateName = 'Plantilla desconocida'
  }
  const block = deliveryBlockReason(project)

  async function exportZip() {
    if (block) {
      const ok = await confirm(`${block} El ZIP se puede generar igualmente.`, 'Exportar ZIP')
      if (!ok) return
    }
    setExporting(true)
    const started = performance.now()
    try {
      const zip = await buildProjectZip({ name: project.name, templateId: project.templateId, content: project.content })
      downloadBlob(zip.blob, zip.fileName)
      api.recordExport(project.id, { fileName: zip.fileName, bytes: zip.bytes })
      api.addTime(project.id, 'exportMs', performance.now() - started)
      setExportMessage(`ZIP descargado: ${zip.fileName} (${formatBytes(zip.bytes)}).`)
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : 'No se pudo crear el ZIP.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <p className="eyebrow"><Link to="/proyectos">Proyectos</Link> / {project.code}</p>
      <header className="page-head row-between">
        <div>
          <h1 className="title">{project.name}</h1>
          <p className="lead">{project.client} · {templateName}</p>
          <div className="row-actions">
            <StatusPill status={project.status} />
            {project.demo ? <Stamp /> : null}
            {isOverdue(project) ? <span className="over">Fecha prevista superada</span> : null}
          </div>
        </div>
        <div className="row-actions">
          <Link className="primary button-link" to={`/proyectos/${project.id}/editor`}>Abrir editor</Link>
          <Link className="button-link" to={`/calidad/${project.id}`}>Control de calidad</Link>
          <button type="button" onClick={exportZip} disabled={exporting}>{exporting ? 'Generando ZIP…' : 'Exportar ZIP'}</button>
        </div>
      </header>
      {statusError ? <Notice tone="bad">{statusError}</Notice> : null}
      {exportMessage ? <Notice>{exportMessage}</Notice> : null}
      {block ? <Notice tone="warn">{block}</Notice> : null}

      <div className="meta-grid">
        <Field label="Nombre">
          <input value={project.name} onChange={(event) => api.updateDetails(project.id, { name: event.target.value })} />
        </Field>
        <Field label="Cliente">
          <input value={project.client} onChange={(event) => api.updateDetails(project.id, { client: event.target.value })} />
        </Field>
        <Field label="Sector">
          <input value={project.sector} onChange={(event) => api.updateDetails(project.id, { sector: event.target.value })} />
        </Field>
        <Field label="Responsable">
          <input value={project.owner} onChange={(event) => api.updateDetails(project.id, { owner: event.target.value })} />
        </Field>
        <Field label="Producto"><input value="Página web" readOnly /></Field>
        <Field label="Fecha prevista">
          <input type="date" value={project.dueDate} onChange={(event) => api.updateDetails(project.id, { dueDate: event.target.value })} />
        </Field>
        <Field label="Estado">
          <select
            value={project.status}
            onChange={(event) => {
              const result = api.setStatus(project.id, event.target.value as ProjectStatus)
              setStatusError(result.ok ? null : result.reason)
            }}
          >
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id} disabled={DELIVERY_STATUSES.includes(status.id) && Boolean(block)}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Plantilla">
          <select
            value={project.templateId}
            onChange={async (event) => {
              const next = event.target.value
              const ok = await confirm('Se sustituye el contenido por el de la nueva plantilla. Se conservan el nombre comercial y el contacto.', 'Cambiar plantilla')
              if (!ok) return
              api.changeTemplate(project.id, next)
            }}
          >
            {TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Demostración">
          <select value={project.demo ? 'si' : 'no'} onChange={(event) => api.updateDetails(project.id, { demo: event.target.value === 'si' })}>
            <option value="no">Proyecto de trabajo</option>
            <option value="si">Marcado como demostración</option>
          </select>
        </Field>
        <Field label="Estimación manual (minutos)" hint="La escribes tú. No se resta del tiempo medido.">
          <input
            type="number"
            min={0}
            value={project.estimateMinutes ?? ''}
            onChange={(event) => {
              const value = event.target.value
              api.updateDetails(project.id, { estimateMinutes: value === '' || !Number.isFinite(Number(value)) ? null : Math.max(0, Number(value)) })
            }}
          />
        </Field>
      </div>

      <section className="panel">
        <h2>Tiempo medido</h2>
        <div className="metrics compact">
          <article><span>Creación</span><b>{formatDuration(project.time.creationMs)}</b></article>
          <article><span>Personalización</span><b>{formatDuration(project.time.customizationMs)}</b></article>
          <article><span>Revisión en pantalla</span><b>{formatDuration(project.time.reviewMs)}</b></article>
          <article><span>Exportación</span><b>{formatDuration(project.time.exportMs)}</b></article>
          <article><span>Total medido</span><b>{formatDuration(measuredMs(project))}</b></article>
        </div>
        <p className="muted">Creado {formatWhen(project.createdAt)} · Actualizado {formatWhen(project.updatedAt)} · Entrega prevista {formatDay(project.dueDate)}</p>
      </section>

      <div className="split">
        <section className="panel">
          <h2>Historial</h2>
          {project.history.length === 0 ? <p className="muted">Sin cambios registrados.</p> : (
            <ol className="activity">
              {project.history.map((event) => (
                <li key={event.id}>
                  <p>{event.message}</p>
                  <time dateTime={event.at}>{formatWhen(event.at)}</time>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="panel">
          <h2>Incidencias</h2>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault()
              if (!incident.title.trim()) return
              api.addIncident(project.id, incident)
              setIncident({ title: '', detail: '', severity: 'media' })
            }}
          >
            <Field label="Nueva incidencia">
              <input value={incident.title} onChange={(event) => setIncident({ ...incident, title: event.target.value })} required />
            </Field>
            <Field label="Detalle">
              <textarea value={incident.detail} onChange={(event) => setIncident({ ...incident, detail: event.target.value })} rows={3} />
            </Field>
            <Field label="Gravedad">
              <select value={incident.severity} onChange={(event) => setIncident({ ...incident, severity: event.target.value as Incident['severity'] })}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </Field>
            <button type="submit">Añadir incidencia</button>
          </form>
          {project.incidents.length === 0 ? <p className="muted">Sin incidencias.</p> : (
            <ul className="incident-list">
              {project.incidents.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <small>{item.severity} · {item.status}</small>
                  <p>{item.detail}</p>
                  {item.status === 'abierta' ? <button type="button" onClick={() => api.resolveIncident(project.id, item.id)}>Marcar resuelta</button> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Exportaciones</h2>
        {project.exports.length === 0 ? <p className="muted">Todavía no hay un ZIP. La exportación genera la web, no una captura.</p> : (
          <ul className="plain-list">
            {project.exports.map((item) => (
              <li key={item.id}>{item.fileName} · {formatBytes(item.bytes)} · {formatWhen(item.at)}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Identificadores Ideark</h2>
        <p className="muted">Se guardan en este proyecto para cuando existan los contratos oficiales. Studio no consulta ningún servicio.</p>
        <div className="meta-grid">
          {IDEARK_SYSTEMS.map((system) => (
            <Field key={system.id} label={system.label} hint={`${system.responsibility} No conectado.`}>
              <input
                value={project.external[system.id]}
                placeholder="Sin identificador"
                onChange={(event) => api.setExternal(project.id, system.id, event.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <details className="panel">
        <summary>Ver configuración</summary>
        <pre className="config">{readableConfig(project.content)}</pre>
      </details>

      <div className="row-actions">
        <button
          type="button"
          onClick={() => {
            const copy = api.duplicateProject(project.id)
            if (copy) navigate(`/proyectos/${copy.id}`)
          }}
        >
          Duplicar proyecto
        </button>
        <button
          type="button"
          className="danger"
          onClick={async () => {
            const ok = await confirm(`Se eliminará ${project.code} de este navegador.`, 'Eliminar')
            if (!ok) return
            api.deleteProject(project.id)
            navigate('/proyectos')
          }}
        >
          Eliminar
        </button>
      </div>
      {dialog}
    </div>
  )
}
