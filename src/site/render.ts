import { normalizeContent, type SiteContent, type TemplateId } from './model'
import { assemble } from './shared'
import { TEMPLATES, getTemplate } from './registry'

export type SiteAsset = { filename: string; bytes: Uint8Array }
export type SitePackage = {
  html: string
  css: string
  js: string
  readme: string
  assets: SiteAsset[]
  files: string[]
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export function extractDataImages(html: string): { html: string; assets: SiteAsset[] } {
  const assets: SiteAsset[] = []
  let count = 0
  const next = html.replace(/src="data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)"/g, (_match, type: string, payload: string) => {
    count += 1
    const extension = type === 'jpeg' ? 'jpg' : type
    const filename = `assets/imagen-${count}.${extension}`
    assets.push({ filename, bytes: decodeBase64(payload) })
    return `src="${filename}"`
  })
  return { html: next, assets }
}

export function readmeFor(templateName: string, content: SiteContent): string {
  return [
    `${content.brandName}`,
    `Plantilla: ${templateName}`,
    '',
    'Cómo abrirla',
    '1. Descomprime esta carpeta.',
    '2. Abre index.html con el navegador.',
    'La página funciona sin Ideark Studio.',
    '',
    'Qué incluye',
    '- index.html, styles.css y site.js.',
    '- Las fotografías que se hayan subido en el editor, dentro de assets/.',
    '- Las ilustraciones de partida van dentro del HTML.',
    '',
    'Servicios externos',
    '- Las tipografías se piden a Google Fonts si hay conexión. Sin red, el navegador usa las fuentes de reserva.',
    '- El enlace de mapa abre OpenStreetMap en otra pestaña.',
    '- El botón de WhatsApp abre wa.me.',
    '- El formulario no envía datos a ningún servidor: solo muestra una confirmación en el dispositivo.',
    '',
    content.footerNote,
    '',
  ].join('\n')
}

export function packageSite(templateId: string, content: SiteContent): SitePackage {
  const template = getTemplate(templateId)
  const normalized = normalizeContent(template, content)
  const built = assemble({
    content: normalized,
    body: template.renderBody(normalized),
    css: template.renderCss(),
    preview: false,
  })
  const extracted = extractDataImages(built.html)
  const readme = readmeFor(template.name, normalized)
  const files = ['index.html', 'styles.css', 'site.js', 'LEEME.txt', ...extracted.assets.map((asset) => asset.filename)]
  return { html: extracted.html, css: built.css, js: built.js, readme, assets: extracted.assets, files }
}

export function previewDocument(templateId: string, content: SiteContent): string {
  const template = getTemplate(templateId)
  const normalized = normalizeContent(template, content)
  return assemble({
    content: normalized,
    body: template.renderBody(normalized),
    css: template.renderCss(),
    preview: true,
  }).html
}

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATES.some((template) => template.id === value)
}
