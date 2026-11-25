import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { previewDocument } from '../../site/render'
import { TEMPLATES, getTemplate } from '../../site/registry'
import { EmptyState } from '../kit'
import { useTitle } from '../useTitle'

const DEVICES = [
  { id: 'ordenador', width: 1280, label: 'Ordenador' },
  { id: 'tablet', width: 834, label: 'Tablet' },
  { id: 'movil', width: 390, label: 'Móvil' },
] as const

export function GalleryPage() {
  useTitle('Galería')
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Studio Web</p>
        <h1 className="title">Seis puntos de partida</h1>
        <p className="lead">No son el mismo diseño con otro color. Cambian la composición, la navegación, la tipografía y los bloques.</p>
      </header>
      <div className="bento">
        {TEMPLATES.map((template) => (
          <article key={template.id} className={`template-card template-${template.id}`}>
            <Link to={`/galeria/${template.id}`} className="thumb" aria-label={`Vista previa de ${template.name}`}>
              <iframe title="" tabIndex={-1} srcDoc={previewDocument(template.id, template.createContent())} />
            </Link>
            <div>
              <p className="eyebrow">{template.sector}</p>
              <h2>{template.name}</h2>
              <p>{template.composition}</p>
              <div className="row-actions">
                <Link to={`/galeria/${template.id}`}>Abrir vista previa</Link>
                <Link to={`/proyectos/nuevo?plantilla=${template.id}`}>Crear proyecto</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function TemplatePage() {
  const { templateId = '' } = useParams()
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('ordenador')
  let template: ReturnType<typeof getTemplate> | null = null
  try {
    template = getTemplate(templateId)
  } catch {
    template = null
  }
  useTitle(template ? template.name : 'Plantilla')
  if (!template) {
    return <div className="page"><EmptyState title="Plantilla no encontrada" text="El catálogo tiene seis plantillas." action={<Link to="/galeria">Volver a la galería</Link>} /></div>
  }
  const current = DEVICES.find((item) => item.id === device) ?? DEVICES[0]
  const html = previewDocument(template.id, template.createContent())
  return (
    <div className="page preview-page">
      <p className="eyebrow"><Link to="/galeria">Galería</Link> / {template.name}</p>
      <header className="page-head row-between">
        <div>
          <h1 className="title">{template.name}</h1>
          <p className="lead">{template.summary}</p>
        </div>
        <Link className="primary button-link" to={`/proyectos/nuevo?plantilla=${template.id}`}>Crear proyecto</Link>
      </header>
      <dl className="difference">
        <div><dt>Composición</dt><dd>{template.composition}</dd></div>
        <div><dt>Navegación</dt><dd>{template.navigation}</dd></div>
        <div><dt>Tipografía</dt><dd>{template.typography}</dd></div>
      </dl>
      {template.futureNote ? <p className="notice notice-info">{template.futureNote}</p> : null}
      <div className="device" role="group" aria-label="Dispositivo">
        {DEVICES.map((item) => (
          <button key={item.id} type="button" className={item.id === device ? 'is-active' : ''} onClick={() => setDevice(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="preview-stage">
        <div className="bezel" style={{ width: `min(100%, ${current.width}px)` }}>
          <iframe title={`Vista previa ${template.name} en ${current.label}`} srcDoc={html} style={{ height: device === 'movil' ? 740 : 860 }} />
        </div>
      </div>
      <p className="footnote">La vista previa es la misma página que se exporta. Los enlaces internos recorren las secciones. WhatsApp, el mapa y las fuentes usan servicios externos.</p>
    </div>
  )
}
