import { contrastRatio } from './color'
import { digits } from './shared'
import type { SiteContent } from './model'

export type QaSeverity = 'ok' | 'warning' | 'error' | 'blocker'

export type QaCheck = {
  id: string
  severity: QaSeverity
  title: string
  detail: string
}

export type QaReport = {
  id: string
  projectId: string
  createdAt: string
  durationMs: number
  contentRevision: number
  checks: QaCheck[]
  summary: { ok: number; warning: number; error: number; blocker: number }
  passed: boolean
}

const PENDING = /\[PENDIENTE\]|lorem ipsum|texto pendiente|\bTBD\b|\bTODO\b/
const FICTIONAL = /datos ficticios|demostraci[oó]n|personaje ficticio|testimonio ficticio|\.invalid\b|600 000/i

function summarize(checks: QaCheck[]): QaReport['summary'] {
  return {
    ok: checks.filter((check) => check.severity === 'ok').length,
    warning: checks.filter((check) => check.severity === 'warning').length,
    error: checks.filter((check) => check.severity === 'error').length,
    blocker: checks.filter((check) => check.severity === 'blocker').length,
  }
}

function isLocal(url: string): boolean {
  if (!url) return false
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return false
  if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) return false
  return true
}

export function runQa(input: {
  projectId: string
  content: SiteContent
  html: string
  css: string
  js: string
  files: string[]
  contentRevision?: number
  now?: string
  id?: string
}): QaReport {
  const started = performance.now()
  const doc = new DOMParser().parseFromString(input.html, 'text/html')
  const checks: QaCheck[] = []
  const title = (doc.querySelector('title')?.textContent ?? '').trim()
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? ''
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? ''
  const lang = doc.documentElement.lang

  checks.push(
    title
      ? title.length > 70
        ? { id: 'meta-title', severity: 'warning', title: 'Título', detail: `El título tiene ${title.length} caracteres. Conviene dejarlo por debajo de 70.` }
        : { id: 'meta-title', severity: 'ok', title: 'Título', detail: title }
      : { id: 'meta-title', severity: 'blocker', title: 'Título', detail: 'Falta la etiqueta title.' },
  )

  checks.push(
    description
      ? description.length < 40 || description.length > 180
        ? { id: 'meta-description', severity: 'warning', title: 'Descripción', detail: `La descripción tiene ${description.length} caracteres.` }
        : { id: 'meta-description', severity: 'ok', title: 'Descripción', detail: description }
      : { id: 'meta-description', severity: 'error', title: 'Descripción', detail: 'Falta la meta description.' },
  )

  checks.push(
    lang
      ? { id: 'lang', severity: 'ok', title: 'Idioma', detail: `lang="${lang}".` }
      : { id: 'lang', severity: 'error', title: 'Idioma', detail: 'Falta el atributo lang en html.' },
  )

  checks.push(
    viewport.includes('width=device-width')
      ? { id: 'viewport', severity: 'ok', title: 'Viewport', detail: 'La página declara un viewport adaptable.' }
      : { id: 'viewport', severity: 'error', title: 'Viewport', detail: 'Falta el meta viewport necesario para el diseño adaptable.' },
  )

  const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')]
  const h1 = headings.filter((heading) => heading.tagName === 'H1')
  checks.push(
    h1.length === 1
      ? { id: 'h1', severity: 'ok', title: 'Encabezado principal', detail: h1[0]?.textContent?.trim() || 'Hay un h1.' }
      : h1.length === 0
        ? { id: 'h1', severity: 'error', title: 'Encabezado principal', detail: 'La página no tiene un h1.' }
        : { id: 'h1', severity: 'warning', title: 'Encabezado principal', detail: `Hay ${h1.length} elementos h1.` },
  )

  let skipped = false
  let previous = 0
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1))
    if (previous && level > previous + 1) skipped = true
    previous = level
  }
  checks.push(
    skipped
      ? { id: 'heading-order', severity: 'warning', title: 'Jerarquía de encabezados', detail: 'Hay un salto de nivel entre encabezados.' }
      : { id: 'heading-order', severity: 'ok', title: 'Jerarquía de encabezados', detail: 'Los niveles de encabezado avanzan sin saltos.' },
  )

  checks.push(
    doc.querySelector('main')
      ? { id: 'main', severity: 'ok', title: 'Contenido principal', detail: 'Existe el elemento main.' }
      : { id: 'main', severity: 'error', title: 'Contenido principal', detail: 'Falta el elemento main.' },
  )

  const imageProblems: string[] = []
  doc.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('alt')) imageProblems.push('Una imagen no tiene atributo alt.')
    const src = image.getAttribute('src') ?? ''
    if (!src) imageProblems.push('Una imagen no tiene src.')
    else if (isLocal(src) && !input.files.includes(src)) imageProblems.push(`No está el archivo ${src}.`)
  })
  doc.querySelectorAll('svg[role="img"]').forEach((svg) => {
    if (!svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby')) {
      imageProblems.push('Un gráfico no tiene nombre accesible.')
    }
  })
  checks.push(
    imageProblems.length
      ? { id: 'images', severity: imageProblems.some((item) => item.includes('No está') || item.includes('no tiene src')) ? 'blocker' : 'error', title: 'Imágenes', detail: imageProblems.slice(0, 4).join(' ') }
      : { id: 'images', severity: 'ok', title: 'Imágenes', detail: 'Las imágenes tienen nombre y un origen resoluble.' },
  )

  const linkProblems: string[] = []
  const ids = new Set([...doc.querySelectorAll('[id]')].map((node) => node.id))
  doc.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href')?.trim() ?? ''
    if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) {
      linkProblems.push('Hay un enlace vacío o inactivo.')
      return
    }
    if (href.startsWith('#')) {
      if (!ids.has(href.slice(1))) linkProblems.push(`El ancla ${href} no existe.`)
      return
    }
    if (isLocal(href) && !input.files.includes(href.split('?')[0] ?? href)) {
      linkProblems.push(`Falta el recurso ${href}.`)
    }
  })
  checks.push(
    linkProblems.length
      ? { id: 'links', severity: 'error', title: 'Enlaces', detail: [...new Set(linkProblems)].slice(0, 4).join(' ') }
      : { id: 'links', severity: 'ok', title: 'Enlaces', detail: 'Los enlaces apuntan a secciones, archivos incluidos o direcciones externas.' },
  )

  const unlabeled: string[] = []
  doc.querySelectorAll('input, textarea, select').forEach((control) => {
    const type = control.getAttribute('type')
    if (type === 'hidden') return
    const id = control.getAttribute('id')
    const named = control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')
    const wrapped = control.closest('label')
    const explicit = id ? doc.querySelector(`label[for="${id.replace(/[^A-Za-z0-9_-]/g, '')}"]`) : null
    if (!named && !wrapped && !explicit) unlabeled.push(id || control.tagName.toLowerCase())
  })
  checks.push(
    unlabeled.length
      ? { id: 'fields', severity: 'error', title: 'Campos de formulario', detail: `Sin etiqueta: ${unlabeled.join(', ')}.` }
      : { id: 'fields', severity: 'ok', title: 'Campos de formulario', detail: 'Cada campo tiene una etiqueta asociada.' },
  )

  const form = doc.querySelector('form[data-site-form]')
  checks.push(
    form && form.querySelector('[data-form-status]') && form.querySelector('button[type="submit"], button:not([type])')
      ? { id: 'form', severity: 'ok', title: 'Formulario', detail: 'El formulario tiene botón de envío y un aviso de resultado. No usa un servidor.' }
      : { id: 'form', severity: 'error', title: 'Formulario', detail: 'Falta el formulario, su botón o el aviso de resultado.' },
  )

  const namelessButtons = [...doc.querySelectorAll('button')].filter((button) => {
    const name = (button.getAttribute('aria-label') || button.textContent || '').trim()
    return !name
  })
  checks.push(
    namelessButtons.length
      ? { id: 'buttons', severity: 'error', title: 'Botones', detail: 'Hay un botón sin nombre accesible.' }
      : { id: 'buttons', severity: 'ok', title: 'Botones', detail: 'Los botones tienen un nombre accesible.' },
  )

  const textContrast = contrastRatio(input.content.colors.text, input.content.colors.background)
  checks.push(
    textContrast >= 4.5
      ? { id: 'contrast-text', severity: 'ok', title: 'Contraste del texto', detail: `Texto sobre fondo: ${textContrast.toFixed(2)}:1.` }
      : { id: 'contrast-text', severity: 'warning', title: 'Contraste del texto', detail: `Texto sobre fondo: ${textContrast.toFixed(2)}:1. El mínimo orientativo es 4.5:1.` },
  )
  const accentBest = Math.max(
    contrastRatio('#ffffff', input.content.colors.accent),
    contrastRatio('#161513', input.content.colors.accent),
  )
  checks.push(
    accentBest >= 4.5
      ? { id: 'contrast-accent', severity: 'ok', title: 'Contraste del acento', detail: `El botón de acento alcanza ${accentBest.toFixed(2)}:1.` }
      : { id: 'contrast-accent', severity: 'warning', title: 'Contraste del acento', detail: `El acento solo alcanza ${accentBest.toFixed(2)}:1.` },
  )

  const mediaQueries = input.css.match(/@media[^{]*\([^)]*max-width/g) ?? []
  checks.push(
    mediaQueries.length >= 2 && viewport.includes('width=device-width')
      ? { id: 'responsive', severity: 'ok', title: 'Diseño adaptable', detail: `Hay ${mediaQueries.length} reglas de ancho máximo además del viewport.` }
      : { id: 'responsive', severity: 'error', title: 'Diseño adaptable', detail: 'No hay suficientes reglas responsive para ordenador, tablet y móvil.' },
  )

  let jsProblem: string | null = null
  try {
    new Function(input.js)
  } catch (error) {
    jsProblem = error instanceof Error ? error.message : 'Sintaxis inválida'
  }
  checks.push(
    jsProblem
      ? { id: 'javascript', severity: 'blocker', title: 'JavaScript', detail: jsProblem }
      : { id: 'javascript', severity: 'ok', title: 'JavaScript', detail: 'site.js se puede interpretar. La comprobación automática no ejecuta el navegador completo.' },
  )

  checks.push(
    input.content.brandName.trim()
      ? { id: 'brand', severity: 'ok', title: 'Nombre comercial', detail: input.content.brandName }
      : { id: 'brand', severity: 'blocker', title: 'Nombre comercial', detail: 'El nombre comercial está vacío.' },
  )
  checks.push(
    input.content.phone.trim()
      ? { id: 'phone', severity: 'ok', title: 'Teléfono', detail: input.content.phone }
      : { id: 'phone', severity: 'blocker', title: 'Teléfono', detail: 'Falta el teléfono.' },
  )
  checks.push(
    input.content.address.trim()
      ? { id: 'address', severity: 'ok', title: 'Dirección', detail: input.content.address }
      : { id: 'address', severity: 'blocker', title: 'Dirección', detail: 'Falta la dirección.' },
  )

  const whatsapp = digits(input.content.whatsapp)
  const hasWhatsappLink = whatsapp ? input.html.includes(`https://wa.me/${whatsapp}`) : true
  checks.push(
    !input.content.whatsapp.trim()
      ? { id: 'whatsapp', severity: 'warning', title: 'WhatsApp', detail: 'No hay un número de WhatsApp.' }
      : whatsapp.length < 9
        ? { id: 'whatsapp', severity: 'warning', title: 'WhatsApp', detail: 'El número de WhatsApp parece incompleto.' }
        : hasWhatsappLink
          ? { id: 'whatsapp', severity: 'ok', title: 'WhatsApp', detail: 'El botón abre wa.me, un servicio externo.' }
          : { id: 'whatsapp', severity: 'error', title: 'WhatsApp', detail: 'El número no aparece como enlace wa.me.' },
  )

  const bodyText = `${title}\n${doc.body.textContent ?? ''}`
  checks.push(
    PENDING.test(bodyText)
      ? { id: 'pending-copy', severity: 'error', title: 'Textos pendientes', detail: 'Quedan marcas de texto sin completar.' }
      : { id: 'pending-copy', severity: 'ok', title: 'Textos pendientes', detail: 'No hay marcas de texto pendiente.' },
  )

  checks.push(
    FICTIONAL.test(bodyText)
      ? { id: 'fictional', severity: 'warning', title: 'Datos ficticios', detail: 'El sitio identifica o contiene datos de demostración, correos .invalid o teléfonos 600 000.' }
      : { id: 'fictional', severity: 'ok', title: 'Datos ficticios', detail: 'No se han detectado las marcas de demostración habituales.' },
  )

  const quotes = [...doc.querySelectorAll('.block-quotes figure')]
  const unlabeledQuotes = quotes.filter((figure) => !/ficticio/i.test(figure.textContent ?? ''))
  checks.push(
    quotes.length === 0
      ? { id: 'testimonials', severity: 'ok', title: 'Testimonios', detail: 'Esta composición no incluye testimonios.' }
      : unlabeledQuotes.length
        ? { id: 'testimonials', severity: 'error', title: 'Testimonios', detail: 'Hay testimonios sin identificar como ficticios.' }
        : { id: 'testimonials', severity: 'warning', title: 'Testimonios', detail: 'Los testimonios están identificados como ficticios. En esta versión no representan reseñas reales.' },
  )

  const missingFiles = ['styles.css', 'site.js', 'LEEME.txt'].filter((file) => !input.files.includes(file))
  const localRefs = new Set<string>()
  doc.querySelectorAll('[src],[href]').forEach((node) => {
    const value = node.getAttribute('src') || node.getAttribute('href') || ''
    if (isLocal(value)) localRefs.add(value.split('?')[0] ?? value)
  })
  const missingRefs = [...localRefs].filter((file) => !input.files.includes(file))
  checks.push(
    missingFiles.length || missingRefs.length
      ? { id: 'resources', severity: 'blocker', title: 'Recursos', detail: `Faltan: ${[...missingFiles, ...missingRefs].join(', ')}.` }
      : { id: 'resources', severity: 'ok', title: 'Recursos', detail: 'index.html, styles.css, site.js y LEEME.txt están en el paquete.' },
  )

  const idsList = [...doc.querySelectorAll('[id]')].map((node) => node.id).filter(Boolean)
  const duplicates = idsList.filter((id, index) => idsList.indexOf(id) !== index)
  checks.push(
    duplicates.length
      ? { id: 'ids', severity: 'warning', title: 'Identificadores', detail: `Hay identificadores repetidos: ${[...new Set(duplicates)].join(', ')}.` }
      : { id: 'ids', severity: 'ok', title: 'Identificadores', detail: 'Los identificadores de la página no se repiten.' },
  )

  const summary = summarize(checks)
  return {
    id: input.id ?? `qa_${Math.random().toString(36).slice(2, 10)}`,
    projectId: input.projectId,
    createdAt: input.now ?? new Date().toISOString(),
    durationMs: Math.max(0, Math.round(performance.now() - started)),
    contentRevision: input.contentRevision ?? 0,
    checks,
    summary,
    passed: summary.blocker === 0 && summary.error === 0,
  }
}
