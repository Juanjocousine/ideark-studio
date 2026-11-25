import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { TEMPLATES } from '../../site/registry'
import { useStudio } from '../../studio/Studio'
import { Field, Notice } from '../kit'
import { useTitle } from '../useTitle'

function defaultDue(): string {
  const date = new Date()
  date.setDate(date.getDate() + 21)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function NewProjectPage() {
  useTitle('Nuevo proyecto')
  const { api } = useStudio()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const started = useRef(performance.now())
  const initialTemplate = TEMPLATES.some((item) => item.id === params.get('plantilla')) ? params.get('plantilla')! : TEMPLATES[0].id
  const initial = TEMPLATES.find((item) => item.id === initialTemplate) ?? TEMPLATES[0]
  const [templateId, setTemplateId] = useState<string>(initial.id)
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [sector, setSector] = useState(initial.sector)
  const [owner, setOwner] = useState('')
  const [dueDate, setDueDate] = useState(defaultDue())
  const [error, setError] = useState<string | null>(null)
  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0]

  return (
    <div className="page narrow">
      <p className="eyebrow"><Link to="/galeria">Galería</Link> / Nuevo</p>
      <h1 className="title">Abrir un proyecto</h1>
      <p className="lead">El producto de esta versión es una página web. El tiempo de esta pantalla se guarda como tiempo de creación medido.</p>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || !client.trim() || !owner.trim() || !dueDate) {
            setError('Nombre, cliente, responsable y fecha prevista son obligatorios.')
            return
          }
          const project = api.createProject({
            name,
            client,
            sector,
            owner,
            dueDate,
            templateId,
            creationMs: Math.round(performance.now() - started.current),
          })
          navigate(`/proyectos/${project.id}/editor`)
        }}
      >
        <Field label="Plantilla">
          <select
            value={templateId}
            onChange={(event) => {
              const next = TEMPLATES.find((item) => item.id === event.target.value)
              setTemplateId(event.target.value)
              if (next) setSector(next.sector)
            }}
          >
            {TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <p className="muted">{template.summary}</p>
        <Field label="Nombre del proyecto">
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Cliente" hint="Usa un nombre ficticio si es una demostración.">
          <input value={client} onChange={(event) => setClient(event.target.value)} required />
        </Field>
        <Field label="Sector">
          <input value={sector} onChange={(event) => setSector(event.target.value)} />
        </Field>
        <Field label="Producto">
          <input value="Página web" readOnly />
        </Field>
        <Field label="Responsable">
          <input value={owner} onChange={(event) => setOwner(event.target.value)} required />
        </Field>
        <Field label="Fecha prevista">
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
        </Field>
        {error ? <Notice tone="bad">{error}</Notice> : null}
        <div className="row-actions">
          <button type="submit" className="primary">Crear y abrir el editor</button>
          <Link to="/proyectos">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
