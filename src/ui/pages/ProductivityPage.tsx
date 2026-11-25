import { Link } from 'react-router-dom'
import { measuredMs } from '../../studio/metrics'
import { useStudio } from '../../studio/Studio'
import { formatDuration } from '../format'
import { EmptyState } from '../kit'
import { useTitle } from '../useTitle'

export function ProductivityPage() {
  useTitle('Productividad')
  const { projects } = useStudio()
  const total = projects.reduce((sum, project) => sum + measuredMs(project), 0)
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Tiempo real</p>
        <h1 className="title">Productividad</h1>
        <p className="lead">Solo aparece el tiempo que la aplicación ha medido en este navegador. No hay un ahorro calculado.</p>
      </header>
      <section className="metrics">
        <article><span>Tiempo medido total</span><b>{formatDuration(total)}</b><small>Suma de creación, personalización, revisión y exportación</small></article>
        <article><span>Proyectos</span><b>{projects.length}</b><small>Incluye demostraciones</small></article>
      </section>
      {projects.length === 0 ? <EmptyState title="Sin mediciones" text="Abre un proyecto y el editor empezará a contar." action={<Link to="/galeria">Crear un proyecto</Link>} /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Creación</th>
                <th>Personalización</th>
                <th>Revisión</th>
                <th>Exportación</th>
                <th>Total medido</th>
                <th>Estimación manual</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td><Link to={`/proyectos/${project.id}`}>{project.code} {project.name}</Link></td>
                  <td>{formatDuration(project.time.creationMs)}</td>
                  <td>{formatDuration(project.time.customizationMs)}</td>
                  <td>{formatDuration(project.time.reviewMs)}</td>
                  <td>{formatDuration(project.time.exportMs)}</td>
                  <td>{formatDuration(measuredMs(project))}</td>
                  <td>{project.estimateMinutes === null ? 'Sin estimación' : `${project.estimateMinutes} min`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="footnote">La estimación manual la escribe una persona en la ficha del proyecto. No se compara como ahorro.</p>
    </div>
  )
}
