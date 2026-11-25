import { defineContent, type SectionDef, type TemplateDefinition } from '../model'
import {
  block,
  e,
  media,
  navLinks,
  navToggle,
  renderForm,
  renderLogo,
  renderMap,
  safeHref,
  renderSocials,
  renderWhatsapp,
  rich,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'inicio', label: 'Inicio', group: 'hero', nav: true },
  { id: 'capacidades', label: 'Capacidades', group: 'services', nav: true },
  { id: 'soluciones', label: 'Soluciones', group: 'cases', nav: true },
  { id: 'instalaciones', label: 'Instalaciones', group: 'gallery', nav: true },
  { id: 'sectores', label: 'Sectores', group: 'zones', nav: true },
  { id: 'contacto', label: 'Contacto', group: 'form', nav: true },
]

function body(content: Parameters<TemplateDefinition['renderBody']>[0]): string {
  const links = navLinks(sections, content)
  return `<div class="site site-industria">
    <header class="spec-bar">
      <div class="spec-id">${renderLogo(content)}${navToggle()}</div>
      <nav aria-label="Secciones" data-nav>${links}</nav>
      <p class="spec-meta">DOC-WEB · DEMO</p>
    </header>
    <main id="contenido">
      ${block(
        content,
        'inicio',
        'hero',
        `<div>
          <p class="code">${e(content.hero.kicker)}</p>
          <h1>${rich(content.hero.title)}</h1>
          <p class="lede">${e(content.hero.subtitle)}</p>
          ${content.hero.cta ? `<a class="btn" href="${e(safeHref(content.hero.ctaHref, '#contacto'))}">${e(content.hero.cta)}</a>` : ''}
        </div>
        <table class="spec-table">
          <caption>Ficha de demostración</caption>
          <tbody>${content.stats
            .map((stat) => `<tr><th scope="row">${e(stat.label)}</th><td>${e(stat.value)}</td></tr>`)
            .join('')}</tbody>
        </table>`,
      )}
      ${block(
        content,
        'capacidades',
        'caps',
        content.services
          .map(
            (service, index) => `<article>
              <p>CAP-${String(index + 1).padStart(2, '0')}</p>
              <h2>${e(service.title)}</h2>
              <p>${e(service.description)}</p>
            </article>`,
          )
          .join(''),
      )}
      ${block(
        content,
        'soluciones',
        'solutions',
        `<h2>Soluciones</h2>${content.cases
          .map(
            (item) => `<details>
              <summary>${e(item.title)} — ${e(item.location)}</summary>
              <p>${e(item.summary)}</p>
            </details>`,
          )
          .join('')}`,
      )}
      ${block(
        content,
        'instalaciones',
        'plant',
        `<h2>Instalaciones</h2><div class="plant-grid">${content.gallery
          .map((item, index) => `<figure>${media(item, index + 4)}<figcaption>${e(item.caption)}</figcaption></figure>`)
          .join('')}</div><p>${e(content.about)}</p>`,
      )}
      ${block(
        content,
        'sectores',
        'sectors',
        `<h2>Sectores</h2><div class="tags" role="list">${content.zones
          .map((zone) => `<span role="listitem">${e(zone)}</span>`)
          .join('')}</div>${renderMap(content)}${renderSocials(content)}`,
      )}
      ${block(content, 'contacto', 'lead', renderForm(content))}
    </main>
    <footer><p>${e(content.brandName)} · ficha de demostración</p><p class="legal">${e(content.footerNote)}</p></footer>
    ${renderWhatsapp(content)}
  </div>`
}

const css = `
.site-industria{background:var(--bg);color:var(--text);font-variant-numeric:tabular-nums}
.site-industria .spec-bar{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding:14px 28px;border-bottom:1px solid color-mix(in srgb,var(--text) 18%,transparent)}
.site-industria .spec-id{display:flex;align-items:center;gap:12px}
.site-industria .logo{display:flex;gap:8px;align-items:center;text-decoration:none;font-family:var(--font-display);font-weight:650}
.site-industria .logo-mark{width:18px;height:18px;border:1px solid var(--accent)}
.site-industria [data-nav]{display:flex;flex-wrap:wrap;gap:14px}
.site-industria [data-nav] a{text-decoration:none;font-size:.92rem}
.site-industria .spec-meta{font-size:.75rem;letter-spacing:.14em}
.site-industria .hero{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;padding:56px 4vw 28px;align-items:start}
.site-industria .code{font-size:.78rem;letter-spacing:.16em;color:var(--accent)}
.site-industria h1{font-family:var(--font-display);font-weight:600;font-size:clamp(3.2rem,6vw,5.4rem);line-height:.92;letter-spacing:-.04em;margin:8px 0 14px}
.site-industria .lede{max-width:46ch}
.site-industria .btn{display:inline-block;margin-top:18px;background:var(--accent);color:var(--on-accent);text-decoration:none;padding:12px 16px}
.site-industria .spec-table{width:100%;border-collapse:collapse;background:var(--surface)}
.site-industria .spec-table caption{text-align:left;font-size:.75rem;letter-spacing:.12em;padding-bottom:8px}
.site-industria .spec-table th,.site-industria .spec-table td{border:1px solid color-mix(in srgb,var(--text) 20%,transparent);padding:10px 12px;text-align:left}
.site-industria .spec-table th{width:42%;color:var(--secondary);font-weight:500}
.site-industria .caps{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid color-mix(in srgb,var(--text) 20%,transparent)}
.site-industria .caps article{padding:22px;border-right:1px solid color-mix(in srgb,var(--text) 20%,transparent);min-height:220px}
.site-industria .caps p:first-child{color:var(--accent);font-size:.78rem;letter-spacing:.12em}
.site-industria .caps h2{font-family:var(--font-display);font-size:1.6rem;margin:12px 0}
.site-industria .solutions,.site-industria .plant,.site-industria .sectors,.site-industria .lead{padding:48px 4vw}
.site-industria h2{font-family:var(--font-display);font-size:2rem;margin-bottom:12px}
.site-industria details{border-top:1px solid color-mix(in srgb,var(--text) 20%,transparent);padding:12px 0}
.site-industria .plant-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px}
.site-industria .plant-grid svg,.site-industria .plant-grid img{height:180px;width:100%;object-fit:cover;background:#0b1014}
.site-industria .tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.site-industria .tags span{border:1px dashed color-mix(in srgb,var(--text) 40%,transparent);padding:8px 10px;font-size:.92rem}
.site-industria .block-form{max-width:720px}
.site-industria footer{padding:20px 4vw 72px;border-top:1px solid color-mix(in srgb,var(--text) 18%,transparent);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.site-industria .legal{color:var(--secondary);max-width:62ch}
@media (max-width:900px){
  .site-industria .spec-bar,.site-industria .hero,.site-industria .caps,.site-industria .plant-grid{grid-template-columns:1fr}
  .site-industria .caps article{border-right:0;border-bottom:1px solid color-mix(in srgb,var(--text) 20%,transparent)}
}
@media (max-width:640px){
  .site-industria h1{font-size:2.7rem}
  .site-industria .spec-meta{display:none}
}
`

export const industria: TemplateDefinition = {
  id: 'industria',
  name: 'Industria',
  sector: 'Industria',
  summary: 'Ficha técnica, capacidades, sectores y captación comercial.',
  composition: 'Barra de especificaciones, tabla de datos junto al titular y capacidades numeradas.',
  navigation: 'Navegación dentro de una barra técnica, con un código de documento.',
  typography: 'Grotesca técnica y cuerpo de lectura neutro.',
  defaultFont: 'tecnico',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Boreal Componentes',
      logoText: 'Boreal',
      tagline: 'Componentes para líneas de producción',
      about: 'La nave y las cifras de esta página son de demostración. No describen una planta real.',
      seoTitle: 'Boreal Componentes · industria',
      seoDescription: 'Web de demostración B2B: capacidades, soluciones, instalaciones, sectores y solicitud comercial. Datos ficticios.',
      phone: '+34 600 000 106',
      whatsapp: '+34 600 000 106',
      email: 'comercial@borealcomponentes.invalid',
      address: 'Polígono de demostración, nave 4',
      city: 'Valencia',
      postalCode: '46000',
      fontPair: 'tecnico',
      colors: {
        primary: '#e7eef3',
        secondary: '#9eb0bd',
        accent: '#ff6a2c',
        background: '#10161b',
        surface: '#182229',
        text: '#e7eef3',
      },
      hero: {
        kicker: 'CAP · DEMO',
        title: 'Componentes\npara seguir produciendo',
        subtitle: 'Piezas de desgaste, series cortas y recambio para líneas de alimentación y packaging.',
        cta: 'Solicitar propuesta',
        ctaHref: '#contacto',
        secondaryCta: 'Ver capacidades',
        secondaryHref: '#capacidades',
        image: '',
      },
      services: [
        { id: 'sv1', title: 'Mecanizado', description: 'Series cortas en aluminio y acero, con plano del cliente.', price: '', meta: '' },
        { id: 'sv2', title: 'Recambio', description: 'Piezas de desgaste repetibles a partir de una muestra.', price: '', meta: '' },
        { id: 'sv3', title: 'Montaje', description: 'Subconjuntos pequeños listos para la línea.', price: '', meta: '' },
        { id: 'sv4', title: 'Control', description: 'Informe dimensional de la serie antes del envío.', price: '', meta: '' },
      ],
      stats: [
        { id: 'st1', label: 'Plazo de muestra', value: '10 días laborables, dato de demostración' },
        { id: 'st2', label: 'Serie habitual', value: 'De 20 a 500 unidades, ejemplo' },
        { id: 'st3', label: 'Materiales', value: 'Aluminio, acero y polímero técnico' },
        { id: 'st4', label: 'Respuesta', value: 'Un interlocutor comercial' },
      ],
      cases: [
        { id: 'c1', title: 'Guía de cinta', location: 'Caso ficticio', summary: 'Sustitución de una guía desgastada sin parar más de un turno. Ejemplo de demostración.' },
        { id: 'c2', title: 'Carcasa de sensor', location: 'Caso ficticio', summary: 'Serie de 80 unidades con informe dimensional. No corresponde a un pedido real.' },
      ],
      gallery: [
        { id: 'g1', alt: 'Nave industrial ilustrada', caption: 'Nave de demostración', image: '', tone: '#ff6a2c' },
        { id: 'g2', alt: 'Mesa de control ilustrada', caption: 'Control', image: '', tone: '#9eb0bd' },
        { id: 'g3', alt: 'Estantería de componentes ilustrada', caption: 'Recambio', image: '', tone: '#3d5160' },
      ],
      zones: ['Alimentación', 'Packaging', 'Automoción auxiliar', 'Maquinaria agrícola'],
      form: {
        title: 'Solicitud comercial',
        intro: 'Describe la pieza en una frase. No adjuntes planos confidenciales: el formulario es local.',
        submitLabel: 'Enviar solicitud',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'empresa', name: 'empresa', label: 'Empresa', type: 'text', required: false, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'email', name: 'email', label: 'Correo', type: 'email', required: false, options: [] },
          { id: 'mensaje', name: 'mensaje', label: 'Qué necesitas fabricar', type: 'textarea', required: true, options: [] },
        ],
      },
      socials: [{ id: 's1', network: 'Ficha', url: 'https://ejemplo.invalid/boreal' }],
      hours: [{ id: 'h1', day: 'Lunes a viernes', hours: '07:30–16:30' }],
      footerNote: 'Datos ficticios de demostración. Boreal Componentes no es una fábrica real.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
