import { Link, useSearchParams } from 'react-router-dom'
import { getTemplate } from '../../site/registry'
import { isOverdue } from '../../studio/metrics'
import { useStudio } from '../../studio/Studio'
import { STATUSES, type ProjectStatus } from '../../studio/types'
import { formatDay } from '../format'
import { EmptyState, Stamp, StatusPill } from '../kit'
import { useTitle } from '../useTitle'

export function ProjectsPage() {
  useTitle('Proyectos')
  const { projects } = useStudio()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const status = params.get('estado') ?? ''
  const visible = projects.filter((project) => {
    const haystack = `${project.name} ${project.client} ${project.code} ${project.owner}`.toLowerCase()
    const matchesQuery = haystack.includes(query.trim().toLowerCase())
    const matchesStatus = !status || project.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <div className="page">
      <header className="page-head row-between">
        <div>
          <p className="eyebrow">Studio Projects</p>
          <h1 className="title">Proyectos</h1>
        </div>
        <Link className="primary button-link" to="/proyectos/nuevo">Nuevo proyecto</Link>
      </header>
      <div className="toolbar">
        <input
          type="search"
          value={query}
          placeholder="Buscar por nombre, cliente o código"
          aria-label="Buscar proyectos"
          onChange={(event) => {
            const next = new URLSearchParams(params)
            if (event.target.value) next.set('q', event.target.value)
            else next.delete('q')
            setParams(next)
          }}
        />
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(event) => {
            const next = new URLSearchParams(params)
            if (event.target.value) next.set('estado', event.target.value)
            else next.delete('estado')
            setParams(next)
          }}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="Todavía no hay proyectos" text="Crea el primero desde una plantilla." action={<Link to="/galeria">Abrir la galería</Link>} />
      ) : visible.length === 0 ? (
        <EmptyState title="Ningún proyecto coincide" text="Prueba con otro nombre o quita el filtro de estado." />
      ) : (
        <div className="cards">
          {visible.map((project) => {
            let templateName = project.templateId
            try {
              templateName = getTemplate(project.templateId).name
            } catch {
              templateName = 'Plantilla desconocida'
            }
            return (
              <article key={project.id} className="card">
                <header>
                  <span className="code">{project.code}</span>
                  {project.demo ? <Stamp /> : null}
                </header>
                <h2><Link to={`/proyectos/${project.id}`}>{project.name}</Link></h2>
                <p>{project.client}</p>
                <p className="muted">{templateName} · {project.owner || 'Sin responsable'}</p>
                <footer>
                  <StatusPill status={project.status as ProjectStatus} />
                  <em className={isOverdue(project) ? 'over' : ''}>Entrega {formatDay(project.dueDate)}</em>
                </footer>
                <div className="row-actions">
                  <Link to={`/proyectos/${project.id}/editor`}>Editar</Link>
                  <Link to={`/calidad/${project.id}`}>Calidad</Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
