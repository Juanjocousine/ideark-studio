import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contrastRatio } from '../../site/color'
import { FONT_PAIRS, type EditorGroup, type SiteContent } from '../../site/model'
import { previewDocument } from '../../site/render'
import { getTemplate } from '../../site/registry'
import { buildProjectZip, downloadBlob } from '../../site/zip'
import { deliveryBlockReason } from '../../studio/metrics'
import { useMeasuredTime, useStudio } from '../../studio/Studio'
import type { Project } from '../../studio/types'
import { formatBytes } from '../format'
import { readResizedImage } from '../images'
import { EmptyState, Field, Notice, useConfirm } from '../kit'
import { useTitle } from '../useTitle'

const DEVICES = [
  { id: 'ordenador', width: 1280, label: 'Ordenador' },
  { id: 'tablet', width: 834, label: 'Tablet' },
  { id: 'movil', width: 390, label: 'Móvil' },
] as const

type Pane = 'vista' | 'secciones' | 'contenido'
type Panel = 'seccion' | 'identidad' | 'estilo' | 'contacto' | 'seo'

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function EditorPage() {
  const { id } = useParams()
  const { projects } = useStudio()
  const project = projects.find((item) => item.id === id)
  useTitle(project ? `Editor · ${project.name}` : 'Editor')
  useMeasuredTime(project?.id, 'customizationMs')
  if (!project) {
    return <div className="page"><EmptyState title="Proyecto no encontrado" text="No está en este navegador." action={<Link to="/proyectos">Volver</Link>} /></div>
  }
  try {
    getTemplate(project.templateId)
  } catch {
    return <div className="page"><EmptyState title="La plantilla no existe" text="No se puede abrir el editor." action={<Link to={`/proyectos/${project.id}`}>Volver al proyecto</Link>} /></div>
  }
  return <EditorWorkspace project={project} />
}

function EditorWorkspace({ project }: { project: Project }) {
  const { api, persistError } = useStudio()
  const template = getTemplate(project.templateId)
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('ordenador')
  const [sectionId, setSectionId] = useState(template.sections[0]?.id ?? 'inicio')
  const [pane, setPane] = useState<Pane>('vista')
  const [panel, setPanel] = useState<Panel>('seccion')
  const [flash, setFlash] = useState('Guardado en este navegador')
  const [imageError, setImageError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const noted = useRef(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 900, height: 700 })
  const { confirm, dialog } = useConfirm()
  const current = DEVICES.find((item) => item.id === device) ?? DEVICES[0]
  const html = previewDocument(template.id, project.content)
  const section = template.sections.find((item) => item.id === sectionId) ?? template.sections[0]
  const scale = Math.min(1, Math.max(0.25, (stage.width - 36) / current.width))
  const frameHeight = Math.max(560, (stage.height - 36) / scale)

  useEffect(() => {
    noted.current = false
    setSectionId(template.sections[0]?.id ?? 'inicio')
  }, [project.id, template])

  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const update = () => setStage({ width: node.clientWidth, height: node.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || panel !== 'seccion') return
    const post = () => frame.contentWindow?.postMessage({ type: 'ideark-scroll', id: sectionId }, '*')
    frame.addEventListener('load', post)
    const timer = window.setTimeout(post, 80)
    return () => {
      frame.removeEventListener('load', post)
      window.clearTimeout(timer)
    }
  }, [html, panel, sectionId])

  function change(recipe: (content: SiteContent) => void) {
    const next = structuredClone(project.content)
    recipe(next)
    const note = noted.current ? undefined : 'Personalización guardada.'
    noted.current = true
    api.updateContent(project.id, next, note)
    setFlash('Guardado en este navegador')
  }

  async function onImage(file: File | undefined, apply: (value: string) => void) {
    if (!file) return
    try {
      const data = await readResizedImage(file)
      apply(data)
      setImageError(null)
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'No se pudo usar la imagen.')
    }
  }

  async function exportZip() {
    const block = deliveryBlockReason(project)
    if (block) {
      const ok = await confirm(`${block} El ZIP se genera igualmente.`, 'Exportar ZIP')
      if (!ok) return
    }
    setExporting(true)
    const started = performance.now()
    try {
      const zip = await buildProjectZip({ name: project.name, templateId: project.templateId, content: project.content })
      downloadBlob(zip.blob, zip.fileName)
      api.recordExport(project.id, { fileName: zip.fileName, bytes: zip.bytes })
      api.addTime(project.id, 'exportMs', performance.now() - started)
      setFlash(`ZIP descargado (${formatBytes(zip.bytes)}).`)
    } catch (error) {
      setFlash(error instanceof Error ? error.message : 'No se pudo crear el ZIP.')
    } finally {
      setExporting(false)
    }
  }

  const textContrast = contrastRatio(project.content.colors.text, project.content.colors.background).toFixed(2)

  return (
    <div className="editor-screen" data-pane={pane}>
      <div className="editor-bar">
        <Link to={`/proyectos/${project.id}`}>{project.code}</Link>
        <strong>{project.name}</strong>
        <div className="device" role="group" aria-label="Dispositivo">
          {DEVICES.map((item) => (
            <button key={item.id} type="button" className={item.id === device ? 'is-active' : ''} onClick={() => setDevice(item.id)}>{item.label}</button>
          ))}
        </div>
        <div className="device mobile-panes" role="group" aria-label="Panel del editor">
          <button type="button" className={pane === 'vista' ? 'is-active' : ''} onClick={() => setPane('vista')}>Vista</button>
          <button type="button" className={pane === 'secciones' ? 'is-active' : ''} onClick={() => setPane('secciones')}>Secciones</button>
          <button type="button" className={pane === 'contenido' ? 'is-active' : ''} onClick={() => setPane('contenido')}>Contenido</button>
        </div>
        <span className="save-state">{persistError ?? flash}</span>
        <button type="button" onClick={() => { api.flush(); setFlash('Guardado en este navegador') }}>Guardar ahora</button>
        <Link to={`/calidad/${project.id}`}>Calidad</Link>
        <button type="button" className="primary" onClick={exportZip} disabled={exporting}>{exporting ? 'Generando…' : 'Exportar ZIP'}</button>
      </div>
      <div className="panes">
        <aside className="section-list">
          {template.sections.map((item) => (
            <div key={item.id} className={item.id === sectionId ? 'section-item is-on' : 'section-item'}>
              <button type="button" onClick={() => { setSectionId(item.id); setPanel('seccion'); setPane('contenido') }}>{item.label}</button>
              <label>
                <input
                  type="checkbox"
                  checked={project.content.sections[item.id] !== false}
                  onChange={(event) => change((content) => { content.sections[item.id] = event.target.checked })}
                />
                Visible
              </label>
            </div>
          ))}
        </aside>
        <div className="canvas-wrap" ref={stageRef}>
          <div className="stage" style={{ width: current.width * scale, height: frameHeight * scale }}>
            <iframe
              ref={frameRef}
              title="Vista previa del proyecto"
              srcDoc={html}
              style={{ width: current.width, height: frameHeight, transform: `scale(${scale})` }}
            />
          </div>
        </div>
        <aside className="props">
          <div className="prop-tabs">
            {([
              ['seccion', 'Sección'],
              ['identidad', 'Identidad'],
              ['estilo', 'Estilo'],
              ['contacto', 'Contacto'],
              ['seo', 'SEO'],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" className={panel === id ? 'is-active' : ''} onClick={() => setPanel(id)}>{label}</button>
            ))}
          </div>
          {imageError ? <Notice tone="bad">{imageError}</Notice> : null}
          {panel === 'identidad' ? (
            <div className="stack">
              <Field label="Nombre comercial"><input value={project.content.brandName} onChange={(event) => change((content) => { content.brandName = event.target.value })} /></Field>
              <Field label="Logotipo, texto"><input value={project.content.logoText} onChange={(event) => change((content) => { content.logoText = event.target.value })} /></Field>
              <Field label="Logotipo, imagen" hint="Opcional. Se incluye en el ZIP.">
                <input type="file" accept="image/*" onChange={(event) => onImage(event.target.files?.[0], (value) => change((content) => { content.logoImage = value }))} />
              </Field>
              {project.content.logoImage ? <button type="button" onClick={() => change((content) => { content.logoImage = '' })}>Quitar logotipo</button> : null}
              <Field label="Frase"><input value={project.content.tagline} onChange={(event) => change((content) => { content.tagline = event.target.value })} /></Field>
              <Field label="Nota del pie"><textarea rows={4} value={project.content.footerNote} onChange={(event) => change((content) => { content.footerNote = event.target.value })} /></Field>
            </div>
          ) : null}
          {panel === 'estilo' ? (
            <div className="stack">
              <Field label="Tipografía">
                <select value={project.content.fontPair} onChange={(event) => change((content) => { content.fontPair = event.target.value as SiteContent['fontPair'] })}>
                  {Object.entries(FONT_PAIRS).map(([id, font]) => <option key={id} value={id}>{font.label}</option>)}
                </select>
              </Field>
              {([
                ['background', 'Fondo'],
                ['surface', 'Superficie'],
                ['text', 'Texto'],
                ['primary', 'Primario'],
                ['secondary', 'Secundario'],
                ['accent', 'Acento'],
              ] as const).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input type="color" value={project.content.colors[key]} onChange={(event) => change((content) => { content.colors[key] = event.target.value })} />
                </Field>
              ))}
              <p className="muted">Contraste texto/fondo ahora: {textContrast}:1. Por debajo de 4,5 el control de calidad lo marcará como advertencia.</p>
            </div>
          ) : null}
          {panel === 'contacto' ? <ContactFields content={project.content} change={change} /> : null}
          {panel === 'seo' ? (
            <div className="stack">
              <Field label="Título"><input value={project.content.seoTitle} onChange={(event) => change((content) => { content.seoTitle = event.target.value })} /></Field>
              <Field label="Descripción"><textarea rows={4} value={project.content.seoDescription} onChange={(event) => change((content) => { content.seoDescription = event.target.value })} /></Field>
            </div>
          ) : null}
          {panel === 'seccion' && section ? (
            <SectionFields sectionLabel={section.label} group={section.group} content={project.content} change={change} onImage={onImage} />
          ) : null}
        </aside>
      </div>
      {dialog}
    </div>
  )
}

function ContactFields({ content, change }: { content: SiteContent; change: (recipe: (content: SiteContent) => void) => void }) {
  return (
    <div className="stack">
      <Field label="Teléfono"><input value={content.phone} onChange={(event) => change((draft) => { draft.phone = event.target.value })} /></Field>
      <Field label="WhatsApp" hint="Se abre en wa.me, fuera de la web."><input value={content.whatsapp} onChange={(event) => change((draft) => { draft.whatsapp = event.target.value })} /></Field>
      <Field label="Correo"><input value={content.email} onChange={(event) => change((draft) => { draft.email = event.target.value })} /></Field>
      <Field label="Dirección"><input value={content.address} onChange={(event) => change((draft) => { draft.address = event.target.value })} /></Field>
      <Field label="Código postal"><input value={content.postalCode} onChange={(event) => change((draft) => { draft.postalCode = event.target.value })} /></Field>
      <Field label="Ciudad"><input value={content.city} onChange={(event) => change((draft) => { draft.city = event.target.value })} /></Field>
      <p className="muted">El mapa es un enlace a OpenStreetMap. Las fuentes se piden a Google Fonts si hay red.</p>
      <HoursFields content={content} change={change} />
      <h3>Redes</h3>
      {content.socials.map((item) => (
        <div key={item.id} className="list-block">
          <input value={item.network} aria-label="Red" onChange={(event) => change((draft) => { const row = draft.socials.find((entry) => entry.id === item.id); if (row) row.network = event.target.value })} />
          <input value={item.url} aria-label="Dirección" onChange={(event) => change((draft) => { const row = draft.socials.find((entry) => entry.id === item.id); if (row) row.url = event.target.value })} />
          <button type="button" onClick={() => change((draft) => { draft.socials = draft.socials.filter((entry) => entry.id !== item.id) })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => change((draft) => { draft.socials.push({ id: uid('red'), network: 'Instagram', url: 'https://' }) })}>Añadir red</button>
    </div>
  )
}

function HoursFields({ content, change }: { content: SiteContent; change: (recipe: (content: SiteContent) => void) => void }) {
  return (
    <div className="stack">
      <h3>Horarios</h3>
      {content.hours.map((item) => (
        <div key={item.id} className="list-block">
          <input value={item.day} aria-label="Día" onChange={(event) => change((draft) => { const row = draft.hours.find((entry) => entry.id === item.id); if (row) row.day = event.target.value })} />
          <input value={item.hours} aria-label="Horas" onChange={(event) => change((draft) => { const row = draft.hours.find((entry) => entry.id === item.id); if (row) row.hours = event.target.value })} />
          <button type="button" onClick={() => change((draft) => { draft.hours = draft.hours.filter((entry) => entry.id !== item.id) })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => change((draft) => { draft.hours.push({ id: uid('hora'), day: 'Lunes', hours: '09:00–18:00' }) })}>Añadir horario</button>
    </div>
  )
}

function SectionFields({
  sectionLabel,
  group,
  content,
  change,
  onImage,
}: {
  sectionLabel: string
  group: EditorGroup
  content: SiteContent
  change: (recipe: (content: SiteContent) => void) => void
  onImage: (file: File | undefined, apply: (value: string) => void) => void
}) {
  return (
    <div className="stack">
      <h2>{sectionLabel}</h2>
      {group === 'hero' ? (
        <>
          <Field label="Antetítulo"><input value={content.hero.kicker} onChange={(event) => change((draft) => { draft.hero.kicker = event.target.value })} /></Field>
          <Field label="Título" hint="Un salto de línea separa las líneas del titular."><textarea rows={3} value={content.hero.title} onChange={(event) => change((draft) => { draft.hero.title = event.target.value })} /></Field>
          <Field label="Texto"><textarea rows={4} value={content.hero.subtitle} onChange={(event) => change((draft) => { draft.hero.subtitle = event.target.value })} /></Field>
          <Field label="Botón principal"><input value={content.hero.cta} onChange={(event) => change((draft) => { draft.hero.cta = event.target.value })} /></Field>
          <Field label="Destino del botón" hint="Usa un ancla como #contacto o una dirección https."><input value={content.hero.ctaHref} onChange={(event) => change((draft) => { draft.hero.ctaHref = event.target.value })} /></Field>
          <Field label="Botón secundario"><input value={content.hero.secondaryCta} onChange={(event) => change((draft) => { draft.hero.secondaryCta = event.target.value })} /></Field>
          <Field label="Destino secundario"><input value={content.hero.secondaryHref} onChange={(event) => change((draft) => { draft.hero.secondaryHref = event.target.value })} /></Field>
          <Field label="Fotografía de portada">
            <input type="file" accept="image/*" onChange={(event) => onImage(event.target.files?.[0], (value) => change((draft) => { draft.hero.image = value }))} />
          </Field>
          {content.hero.image ? <button type="button" onClick={() => change((draft) => { draft.hero.image = '' })}>Quitar fotografía</button> : null}
        </>
      ) : null}
      {group === 'about' ? <Field label="Texto"><textarea rows={8} value={content.about} onChange={(event) => change((draft) => { draft.about = event.target.value })} /></Field> : null}
      {group === 'menu' ? (
        <>
          {content.menu.map((item) => (
            <div key={item.id} className="list-block">
              <input value={item.group} aria-label="Grupo" onChange={(event) => change((draft) => { const row = draft.menu.find((entry) => entry.id === item.id); if (row) row.group = event.target.value })} />
              <input value={item.name} aria-label="Plato" onChange={(event) => change((draft) => { const row = draft.menu.find((entry) => entry.id === item.id); if (row) row.name = event.target.value })} />
              <input value={item.price} aria-label="Precio" onChange={(event) => change((draft) => { const row = draft.menu.find((entry) => entry.id === item.id); if (row) row.price = event.target.value })} />
              <textarea rows={2} value={item.description} aria-label="Descripción" onChange={(event) => change((draft) => { const row = draft.menu.find((entry) => entry.id === item.id); if (row) row.description = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.menu = draft.menu.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.menu.push({ id: uid('plato'), group: 'Carta', name: 'Nuevo plato', description: '', price: '0 €' }) })}>Añadir plato</button>
        </>
      ) : null}
      {group === 'daily' ? (
        <>
          <Field label="Nombre"><input value={content.dailyMenu.name} onChange={(event) => change((draft) => { draft.dailyMenu.name = event.target.value })} /></Field>
          <Field label="Precio"><input value={content.dailyMenu.price} onChange={(event) => change((draft) => { draft.dailyMenu.price = event.target.value })} /></Field>
          <Field label="Platos, uno por línea"><textarea rows={5} value={content.dailyMenu.courses.join('\n')} onChange={(event) => change((draft) => { draft.dailyMenu.courses = event.target.value.split('\n') })} /></Field>
        </>
      ) : null}
      {group === 'services' ? <ServiceFields content={content} change={change} /> : null}
      {group === 'gallery' ? <GalleryFields content={content} change={change} onImage={onImage} /> : null}
      {group === 'compare' ? <CompareFields content={content} change={change} onImage={onImage} /> : null}
      {group === 'team' ? (
        <>
          <p className="muted">El equipo de demostración debe identificarse como personaje ficticio.</p>
          {content.team.map((item) => (
            <div key={item.id} className="list-block">
              <input value={item.name} aria-label="Nombre" onChange={(event) => change((draft) => { const row = draft.team.find((entry) => entry.id === item.id); if (row) row.name = event.target.value })} />
              <input value={item.role} aria-label="Puesto" onChange={(event) => change((draft) => { const row = draft.team.find((entry) => entry.id === item.id); if (row) row.role = event.target.value })} />
              <textarea rows={3} value={item.bio} aria-label="Biografía" onChange={(event) => change((draft) => { const row = draft.team.find((entry) => entry.id === item.id); if (row) row.bio = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.team = draft.team.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.team.push({ id: uid('persona'), name: 'Nombre', role: 'Puesto · personaje ficticio', bio: 'Figura de demostración.' }) })}>Añadir persona</button>
        </>
      ) : null}
      {group === 'faq' ? (
        <>
          {content.faqs.map((item) => (
            <div key={item.id} className="list-block">
              <input value={item.q} aria-label="Pregunta" onChange={(event) => change((draft) => { const row = draft.faqs.find((entry) => entry.id === item.id); if (row) row.q = event.target.value })} />
              <textarea rows={3} value={item.a} aria-label="Respuesta" onChange={(event) => change((draft) => { const row = draft.faqs.find((entry) => entry.id === item.id); if (row) row.a = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.faqs = draft.faqs.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.faqs.push({ id: uid('faq'), q: 'Pregunta', a: 'Respuesta' }) })}>Añadir pregunta</button>
        </>
      ) : null}
      {group === 'testimonials' ? (
        <>
          <p className="muted">En esta versión los testimonios se publican con la etiqueta «Testimonio ficticio».</p>
          {content.testimonials.map((item) => (
            <div key={item.id} className="list-block">
              <textarea rows={3} value={item.quote} aria-label="Cita" onChange={(event) => change((draft) => { const row = draft.testimonials.find((entry) => entry.id === item.id); if (row) row.quote = event.target.value })} />
              <input value={item.name} aria-label="Nombre" onChange={(event) => change((draft) => { const row = draft.testimonials.find((entry) => entry.id === item.id); if (row) row.name = event.target.value })} />
              <input value={item.role} aria-label="Detalle" onChange={(event) => change((draft) => { const row = draft.testimonials.find((entry) => entry.id === item.id); if (row) row.role = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.testimonials = draft.testimonials.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.testimonials.push({ id: uid('nota'), quote: 'Nota de demostración.', name: 'Cliente de demostración', role: 'Nota ficticia' }) })}>Añadir testimonio</button>
        </>
      ) : null}
      {group === 'hours' ? <HoursFields content={content} change={change} /> : null}
      {group === 'form' ? <FormFields content={content} change={change} /> : null}
      {group === 'cases' ? (
        <>
          {content.cases.map((item) => (
            <div key={item.id} className="list-block">
              <input value={item.title} aria-label="Título" onChange={(event) => change((draft) => { const row = draft.cases.find((entry) => entry.id === item.id); if (row) row.title = event.target.value })} />
              <input value={item.location} aria-label="Lugar" onChange={(event) => change((draft) => { const row = draft.cases.find((entry) => entry.id === item.id); if (row) row.location = event.target.value })} />
              <textarea rows={3} value={item.summary} aria-label="Resumen" onChange={(event) => change((draft) => { const row = draft.cases.find((entry) => entry.id === item.id); if (row) row.summary = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.cases = draft.cases.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.cases.push({ id: uid('caso'), title: 'Nuevo caso', location: 'Caso ficticio', summary: '' }) })}>Añadir caso</button>
        </>
      ) : null}
      {group === 'zones' ? <Field label="Zonas, una por línea"><textarea rows={6} value={content.zones.join('\n')} onChange={(event) => change((draft) => { draft.zones = event.target.value.split('\n') })} /></Field> : null}
      {group === 'stats' ? (
        <>
          {content.stats.map((item) => (
            <div key={item.id} className="list-block">
              <input value={item.label} aria-label="Etiqueta" onChange={(event) => change((draft) => { const row = draft.stats.find((entry) => entry.id === item.id); if (row) row.label = event.target.value })} />
              <input value={item.value} aria-label="Valor" onChange={(event) => change((draft) => { const row = draft.stats.find((entry) => entry.id === item.id); if (row) row.value = event.target.value })} />
              <button type="button" onClick={() => change((draft) => { draft.stats = draft.stats.filter((entry) => entry.id !== item.id) })}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={() => change((draft) => { draft.stats.push({ id: uid('dato'), label: 'Paso', value: 'Descripción' }) })}>Añadir dato</button>
        </>
      ) : null}
    </div>
  )
}

function ServiceFields({ content, change }: { content: SiteContent; change: (recipe: (content: SiteContent) => void) => void }) {
  return (
    <>
      {content.services.map((item) => (
        <div key={item.id} className="list-block">
          <input value={item.title} aria-label="Nombre" onChange={(event) => change((draft) => { const row = draft.services.find((entry) => entry.id === item.id); if (row) row.title = event.target.value })} />
          <textarea rows={3} value={item.description} aria-label="Descripción" onChange={(event) => change((draft) => { const row = draft.services.find((entry) => entry.id === item.id); if (row) row.description = event.target.value })} />
          <input value={item.price} aria-label="Precio" placeholder="Precio" onChange={(event) => change((draft) => { const row = draft.services.find((entry) => entry.id === item.id); if (row) row.price = event.target.value })} />
          <input value={item.meta} aria-label="Dato complementario" placeholder="Duración o público" onChange={(event) => change((draft) => { const row = draft.services.find((entry) => entry.id === item.id); if (row) row.meta = event.target.value })} />
          <button type="button" onClick={() => change((draft) => { draft.services = draft.services.filter((entry) => entry.id !== item.id) })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => change((draft) => { draft.services.push({ id: uid('srv'), title: 'Nuevo servicio', description: '', price: '', meta: '' }) })}>Añadir servicio</button>
    </>
  )
}

function GalleryFields({
  content,
  change,
  onImage,
}: {
  content: SiteContent
  change: (recipe: (content: SiteContent) => void) => void
  onImage: (file: File | undefined, apply: (value: string) => void) => void
}) {
  return (
    <>
      {content.gallery.map((item) => (
        <div key={item.id} className="list-block">
          <input value={item.caption} aria-label="Pie" onChange={(event) => change((draft) => { const row = draft.gallery.find((entry) => entry.id === item.id); if (row) row.caption = event.target.value })} />
          <input value={item.alt} aria-label="Texto alternativo" onChange={(event) => change((draft) => { const row = draft.gallery.find((entry) => entry.id === item.id); if (row) row.alt = event.target.value })} />
          <input type="file" accept="image/*" aria-label="Fotografía" onChange={(event) => onImage(event.target.files?.[0], (value) => change((draft) => { const row = draft.gallery.find((entry) => entry.id === item.id); if (row) row.image = value }))} />
          <button type="button" onClick={() => change((draft) => { draft.gallery = draft.gallery.filter((entry) => entry.id !== item.id) })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => change((draft) => { draft.gallery.push({ id: uid('foto'), alt: 'Fotografía', caption: 'Pie de foto', image: '', tone: draft.colors.accent }) })}>Añadir fotografía</button>
    </>
  )
}

function CompareFields({
  content,
  change,
  onImage,
}: {
  content: SiteContent
  change: (recipe: (content: SiteContent) => void) => void
  onImage: (file: File | undefined, apply: (value: string) => void) => void
}) {
  const shots = [0, 1]
  return (
    <>
      <p className="muted">Las dos primeras fotografías de la galería son el antes y el después.</p>
      {shots.map((index) => {
        const item = content.gallery[index]
        if (!item) {
          return <button key={index} type="button" onClick={() => change((draft) => { draft.gallery.push({ id: uid('foto'), alt: index === 0 ? 'Antes de la obra' : 'Después de la obra', caption: index === 0 ? 'Antes' : 'Después', image: '', tone: index === 0 ? '#8d8474' : draft.colors.accent }) })}>Añadir imagen {index === 0 ? 'de antes' : 'de después'}</button>
        }
        return (
          <div key={item.id} className="list-block">
            <input value={item.caption} aria-label="Pie" onChange={(event) => change((draft) => { const row = draft.gallery[index]; if (row) row.caption = event.target.value })} />
            <input value={item.alt} aria-label="Texto alternativo" onChange={(event) => change((draft) => { const row = draft.gallery[index]; if (row) row.alt = event.target.value })} />
            <input type="file" accept="image/*" aria-label="Fotografía" onChange={(event) => onImage(event.target.files?.[0], (value) => change((draft) => { const row = draft.gallery[index]; if (row) row.image = value }))} />
          </div>
        )
      })}
    </>
  )
}

function FormFields({ content, change }: { content: SiteContent; change: (recipe: (content: SiteContent) => void) => void }) {
  return (
    <>
      <Field label="Título"><input value={content.form.title} onChange={(event) => change((draft) => { draft.form.title = event.target.value })} /></Field>
      <Field label="Introducción"><textarea rows={3} value={content.form.intro} onChange={(event) => change((draft) => { draft.form.intro = event.target.value })} /></Field>
      <Field label="Botón"><input value={content.form.submitLabel} onChange={(event) => change((draft) => { draft.form.submitLabel = event.target.value })} /></Field>
      <Field label="Aviso"><textarea rows={3} value={content.form.note} onChange={(event) => change((draft) => { draft.form.note = event.target.value })} /></Field>
      {content.form.fields.map((field) => (
        <div key={field.id} className="list-block">
          <input value={field.label} aria-label="Etiqueta" onChange={(event) => change((draft) => { const row = draft.form.fields.find((entry) => entry.id === field.id); if (row) row.label = event.target.value })} />
          <select value={field.type} aria-label="Tipo" onChange={(event) => change((draft) => { const row = draft.form.fields.find((entry) => entry.id === field.id); if (row) row.type = event.target.value as SiteContent['form']['fields'][number]['type'] })}>
            <option value="text">Texto</option>
            <option value="email">Correo</option>
            <option value="tel">Teléfono</option>
            <option value="date">Fecha</option>
            <option value="textarea">Párrafo</option>
            <option value="select">Lista</option>
          </select>
          <label><input type="checkbox" checked={field.required} onChange={(event) => change((draft) => { const row = draft.form.fields.find((entry) => entry.id === field.id); if (row) row.required = event.target.checked })} /> Obligatorio</label>
          {field.type === 'select' ? <input value={field.options.join(', ')} aria-label="Opciones separadas por coma" onChange={(event) => change((draft) => { const row = draft.form.fields.find((entry) => entry.id === field.id); if (row) row.options = event.target.value.split(',').map((option) => option.trim()) })} /> : null}
          <button type="button" onClick={() => change((draft) => { draft.form.fields = draft.form.fields.filter((entry) => entry.id !== field.id) })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => change((draft) => { draft.form.fields.push({ id: uid('campo'), name: `campo${draft.form.fields.length + 1}`, label: 'Campo', type: 'text', required: false, options: [] }) })}>Añadir campo</button>
    </>
  )
}
