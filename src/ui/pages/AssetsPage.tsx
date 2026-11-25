import { Link } from 'react-router-dom'
import { previewDocument } from '../../site/render'
import { TEMPLATES, getTemplate } from '../../site/registry'
import { renderFaq, renderForm, renderHours, renderMap, renderQuotes, renderTeam, renderWhatsapp } from '../../site/shared'
import { useTitle } from '../useTitle'

const LIBRARY = [
  { id: 'cabeceras', name: 'Cabeceras', summary: 'Cada plantilla construye la suya. No comparten la misma barra.', variants: ['Transparente sobre la portada', 'Barra negra fija', 'Marca centrada', 'Lomo vertical', 'Índice lateral', 'Barra de especificaciones'] },
  { id: 'menus', name: 'Menús', summary: 'La navegación cambia de sitio y de dirección.', variants: ['Horizontal sobre la imagen', 'Horizontal en barra sólida', 'Partido a los lados', 'Segunda línea', 'Vertical en el índice', 'Metadatos técnicos'] },
  { id: 'hero', name: 'Hero', summary: 'El primer pantallazo no repite la misma retícula.', variants: ['Editorial a dos columnas', 'Titular condensado', 'Centrado con aire', 'Descentrado con marco', 'Capítulo y manifiesto', 'Titular más ficha técnica'] },
  { id: 'servicios', name: 'Servicios', summary: 'La lista de oferta cambia de estructura.', variants: ['Carta con precios', 'Filas numeradas', 'Definiciones', 'Cinta horizontal', 'Tabla', 'Fichas CAP'] },
  { id: 'galerias', name: 'Galerías', summary: 'Las imágenes se colocan de forma distinta.', variants: ['Mosaico', 'Comparador', 'Rejilla tranquila', 'Tira de fotogramas', 'No usa galería', 'Plano de nave'] },
  { id: 'testimonios', name: 'Testimonios', summary: 'Siempre identificados como ficticios cuando aparecen.', variants: ['Citas grandes', 'Notas de obra', 'No se usa en clínica', 'Una nota', 'No se usa en el despacho', 'No se usa en industria'] },
  { id: 'equipo', name: 'Equipo', summary: 'Fichas de personas ficticias, solo donde la plantilla las necesita.', variants: ['Tres columnas', 'Lista de despacho', 'Dos perfiles de taller'] },
  { id: 'tarifas', name: 'Tarifas', summary: 'La peluquería usa una carta impresa. El restaurante usa la carta de platos.', variants: ['Ticket del menú del día', 'Hoja de precios girada'] },
  { id: 'faq', name: 'Preguntas frecuentes', summary: 'Acordeón nativo, sin script.', variants: ['Restaurante', 'Clínica', 'Despacho'] },
  { id: 'formularios', name: 'Formularios', summary: 'Validan en el dispositivo y no envían datos a un servidor.', variants: ['Reserva', 'Presupuesto', 'Cita', 'Hora de peluquería', 'Nota al despacho', 'Solicitud comercial'] },
  { id: 'mapas', name: 'Mapas', summary: 'Enlace a OpenStreetMap. No hay un visor incrustado.', variants: ['Bloque de dirección compartido'] },
  { id: 'horarios', name: 'Horarios', summary: 'Lista de días editable.', variants: ['Junto a la dirección', 'Sección propia'] },
  { id: 'whatsapp', name: 'WhatsApp', summary: 'Botón fijo hacia wa.me.', variants: ['Botón de acento en todas las plantillas que tienen número'] },
  { id: 'cta', name: 'Llamadas a la acción', summary: 'Botones con nombre y destino editables.', variants: ['Reserva', 'Presupuesto', 'Cita', 'Hora', 'Escribir', 'Propuesta'] },
  { id: 'pie', name: 'Pie de página', summary: 'Cierra con la nota del proyecto, no con un pie genérico idéntico.', variants: ['Marca enorme', 'Franja de acento', 'Centrado', 'Mínimo', 'Nota al margen', 'Ficha'] },
]

function frame(body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>
    body{margin:0;padding:20px;font-family:Georgia,serif;background:#f6f1e8;color:#231c16}
    h2{font-weight:500;font-size:1.6rem}
    form,dl,div{display:grid;gap:8px}
    input,textarea,select{padding:8px;border:1px solid #cfc4b4;background:transparent}
    button,a.wa{display:inline-block;background:#231c16;color:#f6f1e8;padding:8px 12px;text-decoration:none}
    blockquote{font-size:1.4rem;margin:0}
    .fictional-tag{letter-spacing:.08em;text-transform:uppercase;font-size:.72rem}
  </style></head><body>${body}</body></html>`
}

export function AssetsPage() {
  useTitle('Activos')
  const sample = getTemplate('restaurante').createContent()
  const previews = [
    ['Formulario', frame(renderForm(sample))],
    ['Horarios', frame(renderHours(sample))],
    ['Testimonios', frame(renderQuotes(sample))],
    ['Equipo', frame(renderTeam(getTemplate('clinica').createContent()))],
    ['Preguntas', frame(renderFaq(sample))],
    ['Mapa', frame(renderMap(sample))],
    ['WhatsApp', frame(renderWhatsapp(sample) || '<p>Sin número</p>')],
  ] as const
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Studio Assets</p>
        <h1 className="title">Piezas de la fábrica</h1>
        <p className="lead">Las variantes viven dentro de las plantillas. Esta biblioteca dice cuál se usa y enseña las piezas compartidas.</p>
      </header>
      <div className="asset-thumbs">
        {TEMPLATES.map((template) => (
          <Link key={template.id} to={`/galeria/${template.id}`} className="mini-thumb">
            <iframe title="" tabIndex={-1} srcDoc={previewDocument(template.id, template.createContent())} />
            <span>{template.name}</span>
          </Link>
        ))}
      </div>
      <div className="library">
        {LIBRARY.map((item) => (
          <article key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.summary}</p>
            <ul>{item.variants.map((variant) => <li key={variant}>{variant}</li>)}</ul>
          </article>
        ))}
      </div>
      <h2>Piezas compartidas</h2>
      <div className="shared-grid">
        {previews.map(([name, html]) => (
          <article key={name}>
            <h3>{name}</h3>
            <iframe title={name} srcDoc={html} />
          </article>
        ))}
      </div>
    </div>
  )
}
