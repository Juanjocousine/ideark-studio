import { defineContent, type SectionDef, type TemplateDefinition } from '../model'
import {
  block,
  e,
  media,
  navToggle,
  paragraphs,
  renderFaq,
  renderForm,
  renderHours,
  renderLogo,
  renderMap,
  renderTeam,
  safeHref,
  renderWhatsapp,
  rich,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'inicio', label: 'Inicio', group: 'hero', nav: true },
  { id: 'especialidades', label: 'Especialidades', group: 'services', nav: true },
  { id: 'equipo', label: 'Equipo', group: 'team', nav: true },
  { id: 'instalaciones', label: 'Instalaciones', group: 'gallery', nav: true },
  { id: 'cita', label: 'Cita', group: 'form', nav: true },
  { id: 'horarios', label: 'Horarios', group: 'hours', nav: true },
  { id: 'preguntas', label: 'Preguntas', group: 'faq' },
]

function splitNav(content: Parameters<TemplateDefinition['renderBody']>[0]): { left: string; right: string } {
  const visible = sections.filter((section) => section.nav && content.sections[section.id] !== false)
  const mid = Math.ceil(visible.length / 2)
  const link = (section: (typeof visible)[number]) => `<a href="#${e(section.id)}">${e(section.label)}</a>`
  return { left: visible.slice(0, mid).map(link).join(''), right: visible.slice(mid).map(link).join('') }
}

function body(content: Parameters<TemplateDefinition['renderBody']>[0]): string {
  const nav = splitNav(content)
  return `<div class="site site-clinica">
    <header class="quiet-center">
      ${renderLogo(content)}
      ${navToggle()}
      <nav aria-label="Secciones" data-nav><span class="nav-left">${nav.left}</span><span class="nav-right">${nav.right}</span></nav>
    </header>
    <main id="contenido">
      ${block(
        content,
        'inicio',
        'hero',
        `<p class="kicker">${e(content.hero.kicker)}</p>
        <h1>${rich(content.hero.title)}</h1>
        <p class="lede">${e(content.hero.subtitle)}</p>
        ${content.hero.cta ? `<a class="btn" href="${e(safeHref(content.hero.ctaHref, '#cita'))}">${e(content.hero.cta)}</a>` : ''}`,
      )}
      ${block(content, 'especialidades', 'specialties', `<h2>Especialidades</h2><dl class="specialty-list">${content.services
        .map((service) => `<div><dt>${e(service.title)}</dt><dd>${e(service.description)}</dd></div>`)
        .join('')}</dl>`)}
      ${block(content, 'equipo', 'team', `<h2>Equipo</h2><p class="note">Personajes ficticios. No son profesionales reales.</p>${renderTeam(content)}`)}
      ${block(
        content,
        'instalaciones',
        'rooms',
        `<h2>Instalaciones</h2><div class="room-grid">${content.gallery
          .map((item, index) => `<figure>${media(item, index + 2)}<figcaption>${e(item.caption)}</figcaption></figure>`)
          .join('')}</div>${paragraphs(content.about)}`,
      )}
      ${block(content, 'cita', 'appointment', renderForm(content))}
      ${block(content, 'horarios', 'hours', `<h2>Horarios</h2>${renderHours(content)}`)}
      ${block(content, 'preguntas', 'faq', `<h2>Preguntas frecuentes</h2>${renderFaq(content)}`)}
      <section class="visit">${renderMap(content)}</section>
    </main>
    <footer><p>${e(content.brandName)}</p><p class="legal">${e(content.footerNote)}</p></footer>
    ${renderWhatsapp(content)}
  </div>`
}

const css = `
.site-clinica{background:var(--bg);color:var(--text)}
.site-clinica .quiet-center{padding:28px 8vw 10px;display:grid;justify-items:center;gap:14px;text-align:center}
.site-clinica .logo{display:flex;gap:10px;align-items:center;text-decoration:none;font-family:var(--font-display);font-size:2rem;font-weight:500}
.site-clinica .logo-mark{display:none}
.site-clinica [data-nav]{display:flex;gap:48px;width:min(860px,100%);justify-content:space-between}
.site-clinica .nav-left,.site-clinica .nav-right{display:flex;gap:18px}
.site-clinica [data-nav] a{text-decoration:none;font-size:.92rem}
.site-clinica .hero{padding:10vh 8vw 8vh;text-align:center}
.site-clinica h1{font-family:var(--font-display);font-weight:500;font-size:clamp(3.6rem,7vw,6.4rem);line-height:.92;max-width:12ch;margin:12px auto 0}
.site-clinica .kicker{letter-spacing:.16em;text-transform:uppercase;font-size:.75rem;color:var(--secondary)}
.site-clinica .lede{max-width:46ch;margin:18px auto 0;font-size:1.08rem}
.site-clinica .btn{display:inline-block;margin-top:26px;text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:4px}
.site-clinica .specialties,.site-clinica .team,.site-clinica .rooms,.site-clinica .appointment,.site-clinica .hours,.site-clinica .faq,.site-clinica .visit{padding:64px 10vw}
.site-clinica h2{font-family:var(--font-display);font-weight:500;font-size:clamp(2.6rem,4vw,4rem);margin-bottom:22px}
.site-clinica .specialty-list{display:grid;grid-template-columns:1fr 1fr;gap:28px 48px}
.site-clinica .specialty-list dt{font-family:var(--font-display);font-size:1.8rem}
.site-clinica .specialty-list dd{margin:6px 0 0;color:var(--secondary)}
.site-clinica .note{margin:-8px 0 18px;color:var(--secondary)}
.site-clinica .block-team{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.site-clinica .avatar{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--text) 30%,transparent);font-family:var(--font-display);font-size:1.6rem}
.site-clinica .role{color:var(--secondary);margin:4px 0 8px}
.site-clinica .room-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:18px}
.site-clinica .room-grid figure:first-child{grid-row:span 2}
.site-clinica .room-grid svg,.site-clinica .room-grid img{width:100%;height:220px;object-fit:cover;background:#e7e1d8}
.site-clinica .room-grid figure:first-child svg,.site-clinica .room-grid figure:first-child img{height:100%;min-height:280px}
.site-clinica figcaption{margin-top:8px;color:var(--secondary)}
.site-clinica .appointment{background:var(--surface)}
.site-clinica .block-form{max-width:640px}
.site-clinica .block-hours div{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.site-clinica .block-hours dl{margin:0}
.site-clinica details{padding:12px 0;border-top:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.site-clinica footer{padding:28px 10vw 72px;text-align:center}
.site-clinica .legal{color:var(--secondary);max-width:60ch;margin:8px auto 0}
@media (max-width:900px){
  .site-clinica .specialty-list,.site-clinica .block-team,.site-clinica .room-grid{grid-template-columns:1fr}
  .site-clinica .room-grid figure:first-child{grid-row:auto}
  .site-clinica [data-nav]{flex-direction:column;gap:8px}
}
@media (max-width:640px){
  .site-clinica h1{font-size:3rem}
  .site-clinica .specialties,.site-clinica .team,.site-clinica .rooms,.site-clinica .appointment,.site-clinica .hours,.site-clinica .faq,.site-clinica .visit{padding:48px 6vw}
}
`

export const clinica: TemplateDefinition = {
  id: 'clinica',
  name: 'Clínica',
  sector: 'Salud',
  summary: 'Especialidades, equipo ficticio, instalaciones y solicitud de cita.',
  composition: 'Portada centrada con mucho aire, especialidades en lista y equipo en tres columnas.',
  navigation: 'Marca centrada con enlaces repartidos a izquierda y derecha.',
  typography: 'Serif clásica de cuerpo alto y sans humanista.',
  defaultFont: 'sereno',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Clínica Alba Norte',
      logoText: 'Alba Norte',
      tagline: 'Medicina familiar, dermatología y fisioterapia',
      about: 'Las salas de esta página son ilustraciones. No hay historia clínica ni datos de pacientes.',
      seoTitle: 'Clínica Alba Norte · demostración',
      seoDescription: 'Web de demostración de una clínica: especialidades, equipo ficticio, instalaciones y solicitud de cita. Sin datos médicos reales.',
      phone: '+34 600 000 103',
      whatsapp: '+34 600 000 103',
      email: 'citas@clinicaalbanorte.invalid',
      address: 'Plaza de la Acequia 3',
      city: 'Valencia',
      postalCode: '46003',
      fontPair: 'sereno',
      colors: {
        primary: '#1c3330',
        secondary: '#5e706b',
        accent: '#1f4f45',
        background: '#f3f0ea',
        surface: '#fffcf8',
        text: '#1c3330',
      },
      hero: {
        kicker: 'Clínica de demostración',
        title: 'Tiempo\npara escucharte',
        subtitle: 'Medicina familiar, dermatología general y fisioterapia. La solicitud de cita no recoge historia clínica.',
        cta: 'Solicitar cita',
        ctaHref: '#cita',
        secondaryCta: '',
        secondaryHref: '#especialidades',
        image: '',
      },
      services: [
        { id: 'sv1', title: 'Medicina familiar', description: 'Seguimiento general y orientación. No sustituye una urgencia.', price: '', meta: '' },
        { id: 'sv2', title: 'Dermatología', description: 'Revisión de piel y cuidado general. Sin diagnósticos en esta web.', price: '', meta: '' },
        { id: 'sv3', title: 'Fisioterapia', description: 'Sesiones de recuperación funcional bajo cita.', price: '', meta: '' },
        { id: 'sv4', title: 'Revisiones', description: 'Controles periódicos acordados con el equipo.', price: '', meta: '' },
      ],
      team: [
        { id: 'p1', name: 'Elena Serra', role: 'Medicina familiar · personaje ficticio', bio: 'Figura de demostración. No corresponde a una profesional colegiada real.' },
        { id: 'p2', name: 'Marc Soler', role: 'Dermatología · personaje ficticio', bio: 'Figura de demostración para mostrar la ficha de equipo.' },
        { id: 'p3', name: 'Nuria Vidal', role: 'Fisioterapia · personaje ficticio', bio: 'Figura de demostración. La biografía no describe un caso clínico.' },
      ],
      gallery: [
        { id: 'g1', alt: 'Sala de espera amplia e ilustrada', caption: 'Espera', image: '', tone: '#c8b8a2' },
        { id: 'g2', alt: 'Consulta luminosa ilustrada', caption: 'Consulta', image: '', tone: '#8aa399' },
        { id: 'g3', alt: 'Sala de fisioterapia ilustrada', caption: 'Sala de movimiento', image: '', tone: '#1f4f45' },
      ],
      faqs: [
        { id: 'f1', q: '¿La web guarda datos de salud?', a: 'No. El formulario solo pide nombre, teléfono y el motivo en términos generales, y no se envía a ningún servidor.' },
        { id: 'f2', q: '¿Puedo pedir cita urgente?', a: 'Esta demostración no gestiona urgencias. En un caso real habría que llamar a los servicios sanitarios.' },
      ],
      hours: [
        { id: 'h1', day: 'Lunes a viernes', hours: '09:00–14:00 · 16:00–20:00' },
        { id: 'h2', day: 'Sábado', hours: '09:30–13:00' },
        { id: 'h3', day: 'Domingo', hours: 'Cerrado' },
      ],
      form: {
        title: 'Solicitar cita',
        intro: 'Indica un motivo general. No escribas datos clínicos: esta web de demostración no los recoge ni los envía.',
        submitLabel: 'Enviar solicitud',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor. No es una historia clínica.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'fecha', name: 'fecha', label: 'Fecha preferida', type: 'date', required: false, options: [] },
          { id: 'especialidad', name: 'especialidad', label: 'Especialidad', type: 'select', required: true, options: ['Medicina familiar', 'Dermatología', 'Fisioterapia'] },
          { id: 'mensaje', name: 'mensaje', label: 'Motivo general', type: 'textarea', required: false, options: [] },
        ],
      },
      footerNote: 'Datos ficticios de demostración. Clínica Alba Norte no es un centro sanitario real y no trata datos de pacientes.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
