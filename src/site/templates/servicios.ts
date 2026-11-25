import { defineContent, type SectionDef, type TemplateDefinition } from '../model'
import {
  block,
  e,
  navLinks,
  navToggle,
  paragraphs,
  renderFaq,
  renderForm,
  renderLogo,
  renderMap,
  renderTeam,
  renderWhatsapp,
  telHref,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'estudio', label: 'Estudio', group: 'about', nav: true },
  { id: 'servicios', label: 'Servicios', group: 'services', nav: true },
  { id: 'metodo', label: 'Método', group: 'stats', nav: true },
  { id: 'equipo', label: 'Equipo', group: 'team', nav: true },
  { id: 'preguntas', label: 'Preguntas', group: 'faq' },
  { id: 'contacto', label: 'Contacto', group: 'form', nav: true },
]

function body(content: Parameters<TemplateDefinition['renderBody']>[0]): string {
  const links = navLinks(sections, content)
  return `<div class="site site-servicios">
    <aside class="chapter-rail">
      ${renderLogo(content)}
      ${navToggle()}
      <nav aria-label="Secciones" data-nav>${links}</nav>
      <p><a href="${telHref(content.phone)}">${e(content.phone)}</a></p>
      <p>${e(content.address)}<br>${e(content.postalCode)} ${e(content.city)}</p>
    </aside>
    <main id="contenido">
      ${block(
        content,
        'estudio',
        'chapter',
        `<p class="chapter-no">Capítulo 01</p>
        <h1>${e(content.hero.title).replace(/\n/g, ' ')}</h1>
        <div class="manifesto">${paragraphs(content.about)}<p>${e(content.hero.subtitle)}</p></div>`,
      )}
      ${block(
        content,
        'servicios',
        'services',
        `<h2>Servicios</h2>
        <table class="service-matrix">
          <caption class="sr">Servicios del despacho</caption>
          <thead><tr><th>Servicio</th><th>Para quién</th><th>Resultado</th></tr></thead>
          <tbody>${content.services
            .map(
              (service) =>
                `<tr><th scope="row">${e(service.title)}</th><td>${e(service.meta)}</td><td>${e(service.description)}</td></tr>`,
            )
            .join('')}</tbody>
        </table>`,
      )}
      ${block(
        content,
        'metodo',
        'method',
        `<h2>Método</h2><ol class="timeline">${content.stats
          .map((stat, index) => `<li><span>0${index + 1}</span><h3>${e(stat.label)}</h3><p>${e(stat.value)}</p></li>`)
          .join('')}</ol>`,
      )}
      ${block(content, 'equipo', 'people', `<h2>Despacho</h2><p class="note">Personajes ficticios.</p>${renderTeam(content)}`)}
      ${block(content, 'preguntas', 'faq', `<h2>Preguntas</h2>${renderFaq(content)}`)}
      ${block(content, 'contacto', 'letter', `${renderForm(content)}${renderMap(content)}`)}
    </main>
    <footer class="endnote"><p class="legal">${e(content.footerNote)}</p></footer>
    ${renderWhatsapp(content)}
  </div>`
}

const css = `
.site-servicios{display:grid;grid-template-columns:240px 1fr;background:var(--bg);color:var(--text);min-height:100vh}
.site-servicios .chapter-rail{position:sticky;top:0;height:100vh;padding:28px 22px;background:#1d2430;color:#f4efe6;display:flex;flex-direction:column;gap:18px}
.site-servicios .logo{display:flex;flex-direction:column;text-decoration:none;font-family:var(--font-display);font-size:1.7rem;line-height:1.05}
.site-servicios .logo-mark{display:none}
.site-servicios [data-nav]{display:flex;flex-direction:column;gap:10px}
.site-servicios [data-nav] a{text-decoration:none}
.site-servicios .chapter-rail p{margin-top:auto;font-size:.92rem}
.site-servicios main{padding:64px 7vw 40px}
.site-servicios .chapter-no{letter-spacing:.16em;text-transform:uppercase;font-size:.75rem;color:var(--secondary)}
.site-servicios h1{font-family:var(--font-display);font-weight:400;font-size:clamp(3rem,5vw,4.8rem);line-height:1.05;max-width:16ch;margin:10px 0 18px}
.site-servicios .manifesto{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;font-size:1.05rem}
.site-servicios .manifesto p:first-child{font-size:1.35rem;line-height:1.35}
.site-servicios h2{font-family:var(--font-display);font-size:2.4rem;font-weight:400;margin:64px 0 16px}
.site-servicios .service-matrix{width:100%;border-collapse:collapse}
.site-servicios .service-matrix th,.site-servicios .service-matrix td{text-align:left;vertical-align:top;padding:14px 12px;border-top:1px solid color-mix(in srgb,var(--text) 20%,transparent)}
.site-servicios .service-matrix thead th{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--secondary)}
.site-servicios .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.site-servicios .timeline{list-style:none;margin:0;padding:0 0 0 18px;border-left:1px solid var(--primary);display:grid;gap:22px}
.site-servicios .timeline span{font-family:var(--font-display)}
.site-servicios .block-team{display:grid;gap:18px}
.site-servicios .block-team li{display:grid;grid-template-columns:160px 1fr;gap:12px;padding-top:12px;border-top:1px solid color-mix(in srgb,var(--text) 16%,transparent)}
.site-servicios .avatar{display:none}
.site-servicios .note{color:var(--secondary)}
.site-servicios details{border-top:1px solid color-mix(in srgb,var(--text) 16%,transparent);padding:12px 0}
.site-servicios .letter{display:grid;grid-template-columns:1.1fr .9fr;gap:32px;margin-top:24px}
.site-servicios .endnote{grid-column:2;padding:10px 7vw 70px}
.site-servicios .legal{color:var(--secondary);max-width:62ch}
@media (max-width:900px){
  .site-servicios{grid-template-columns:1fr}
  .site-servicios .chapter-rail{position:relative;height:auto}
  .site-servicios .manifesto,.site-servicios .letter,.site-servicios .block-team li{grid-template-columns:1fr}
  .site-servicios .endnote{grid-column:1}
}
@media (max-width:640px){
  .site-servicios main{padding:36px 6vw}
  .site-servicios .service-matrix,.site-servicios .service-matrix tbody,.site-servicios .service-matrix tr,.site-servicios .service-matrix th,.site-servicios .service-matrix td{display:block}
  .site-servicios .service-matrix thead{display:none}
}
`

export const servicios: TemplateDefinition = {
  id: 'servicios',
  name: 'Servicios profesionales',
  sector: 'Servicios profesionales',
  summary: 'Despacho con índice lateral, matriz de servicios y método.',
  composition: 'Rail fijo a la izquierda y cuerpo en capítulos, con una tabla en lugar de tarjetas.',
  navigation: 'Menú vertical dentro del índice, no hay barra superior.',
  typography: 'Serif de lectura y grotesca contemporánea.',
  defaultFont: 'estudio',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Norte Claro',
      logoText: 'Norte Claro',
      tagline: 'Asesoría y consultoría',
      about:
        'Acompañamos a negocios pequeños en fiscalidad, laboral y orden societario.\n\nEl despacho de esta página es ficticio. No presta servicios ni sustituye a un asesor.',
      seoTitle: 'Norte Claro · despacho profesional',
      seoDescription: 'Web de demostración para una asesoría: servicios, método, equipo ficticio y contacto. Sin clientes reales.',
      phone: '+34 600 000 105',
      whatsapp: '+34 600 000 105',
      email: 'estudio@norteclaro.invalid',
      address: 'Calle de la Paz 9',
      city: 'Valencia',
      postalCode: '46003',
      fontPair: 'estudio',
      colors: {
        primary: '#1d2430',
        secondary: '#6d5a40',
        accent: '#1d2430',
        background: '#efe8dc',
        surface: '#f7f1e6',
        text: '#1d2430',
      },
      hero: {
        kicker: 'Despacho de demostración',
        title: 'Criterio sereno para decidir',
        subtitle: 'Trabajamos por escrito, con un calendario y una persona de referencia.',
        cta: 'Escribir al despacho',
        ctaHref: '#contacto',
        secondaryCta: 'Ver servicios',
        secondaryHref: '#servicios',
        image: '',
      },
      services: [
        { id: 'sv1', title: 'Fiscal', description: 'Calendario de obligaciones y revisión trimestral.', price: '', meta: 'Autónomos y sociedades' },
        { id: 'sv2', title: 'Laboral', description: 'Altas, nóminas y contratos de una plantilla pequeña.', price: '', meta: 'Equipos de hasta 30 personas' },
        { id: 'sv3', title: 'Societario', description: 'Actas, pactos y acompañamiento en una junta.', price: '', meta: 'Sociedades familiares' },
        { id: 'sv4', title: 'Consulta', description: 'Una sesión para ordenar una decisión concreta.', price: '', meta: 'Quien necesita una segunda lectura' },
      ],
      stats: [
        { id: 'p1', label: 'Encargo', value: 'Definimos el alcance por escrito.' },
        { id: 'p2', label: 'Lectura', value: 'Revisamos la documentación que ya existe.' },
        { id: 'p3', label: 'Propuesta', value: 'Dejamos opciones y una recomendación.' },
        { id: 'p4', label: 'Seguimiento', value: 'Una reunión fija al trimestre.' },
      ],
      team: [
        { id: 'p1', name: 'Clara Noguera', role: 'Socia · personaje ficticio', bio: 'Figura de demostración. No es una profesional colegiada real.' },
        { id: 'p2', name: 'Andrés Molina', role: 'Laboral · personaje ficticio', bio: 'Figura de demostración para la página del despacho.' },
      ],
      faqs: [
        { id: 'f1', q: '¿Sustituye esta web a un asesor?', a: 'No. Es una demostración visual. No hay relación profesional ni consejo aplicable.' },
        { id: 'f2', q: '¿Guardáis documentos?', a: 'El formulario no adjunta archivos y no envía datos a un servidor.' },
      ],
      form: {
        title: 'Escribir al despacho',
        intro: 'Cuéntanos el motivo en una frase. No envíes documentación confidencial: este formulario es local.',
        submitLabel: 'Enviar nota',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'email', name: 'email', label: 'Correo', type: 'email', required: false, options: [] },
          { id: 'mensaje', name: 'mensaje', label: 'Motivo', type: 'textarea', required: true, options: [] },
        ],
      },
      hours: [{ id: 'h1', day: 'Lunes a jueves', hours: '09:00–17:30' }],
      footerNote: 'Datos ficticios de demostración. Norte Claro no es un despacho real.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
