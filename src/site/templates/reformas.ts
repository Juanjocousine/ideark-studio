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
  renderQuotes,
  renderSocials,
  renderWhatsapp,
  rich,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'inicio', label: 'Inicio', group: 'hero', nav: true },
  { id: 'servicios', label: 'Servicios', group: 'services', nav: true },
  { id: 'proyectos', label: 'Proyectos', group: 'cases', nav: true },
  { id: 'comparativa', label: 'Antes y después', group: 'compare', nav: true },
  { id: 'zonas', label: 'Zonas', group: 'zones', nav: true },
  { id: 'proceso', label: 'Proceso', group: 'stats' },
  { id: 'presupuesto', label: 'Presupuesto', group: 'form', nav: true },
  { id: 'testimonios', label: 'Testimonios', group: 'testimonials' },
]

function body(content: Parameters<TemplateDefinition['renderBody']>[0]): string {
  const links = navLinks(sections, content)
  const before = content.gallery[0]
  const after = content.gallery[1]
  return `<div class="site site-reformas">
    <header class="specbar">
      ${renderLogo(content)}
      ${navToggle()}
      <nav aria-label="Secciones" data-nav>${links}</nav>
    </header>
    <main id="contenido">
      ${block(
        content,
        'inicio',
        'hero',
        `<p class="index">01 — Reformas</p>
        <h1>${rich(content.hero.title)}</h1>
        <p class="lede">${e(content.hero.subtitle)}</p>
        <div class="actions">
          ${content.hero.cta ? `<a class="btn" href="${e(safeHref(content.hero.ctaHref, '#presupuesto'))}">${e(content.hero.cta)}</a>` : ''}
          ${content.hero.secondaryCta ? `<a class="textlink" href="${e(safeHref(content.hero.secondaryHref, '#servicios'))}">${e(content.hero.secondaryCta)}</a>` : ''}
        </div>`,
      )}
      ${block(
        content,
        'servicios',
        'service-index',
        content.services
          .map(
            (service, index) => `<article>
              <span>${String(index + 1).padStart(2, '0')}</span>
              <h2>${e(service.title)}</h2>
              <p>${e(service.description)}</p>
            </article>`,
          )
          .join(''),
      )}
      ${block(
        content,
        'proyectos',
        'cases',
        `<header><p class="index">Proyectos de demostración</p><h2>Obras recientes</h2></header>
        <div class="case-row">${content.cases
          .map(
            (item) => `<article>
              <p>${e(item.location)}</p>
              <h3>${e(item.title)}</h3>
              <p>${e(item.summary)}</p>
            </article>`,
          )
          .join('')}</div>`,
      )}
      ${block(
        content,
        'comparativa',
        'compare-section',
        `<h2>Antes y después</h2>
        <div class="compare" data-compare>
          <div class="compare-frame">
            <div class="shot shot-before">${before ? media(before, 4) : ''}<span>Antes</span></div>
            <div class="shot shot-after" data-after><div class="shot-inner">${after ? media(after, 1) : ''}<span>Después</span></div></div>
          </div>
          <label for="comparador">Arrastra para comparar antes y después</label>
          <input id="comparador" type="range" min="0" max="100" value="54">
        </div>`,
      )}
      ${block(
        content,
        'zonas',
        'zones',
        `<div><p class="index">Dónde actuamos</p><h2>Zonas</h2><p>${e(content.about)}</p>${renderMap(content)}</div>
        <div class="zone-map" role="list">${content.zones.map((zone) => `<span role="listitem">${e(zone)}</span>`).join('')}</div>`,
      )}
      ${block(
        content,
        'proceso',
        'process',
        content.stats
          .map(
            (stat, index) => `<article><span>0${index + 1}</span><strong>${e(stat.value)}</strong><h3>${e(stat.label)}</h3></article>`,
          )
          .join(''),
      )}
      ${block(content, 'presupuesto', 'quote', renderForm(content))}
      ${block(content, 'testimonios', 'quotes', `<h2>Notas de obra</h2>${renderQuotes(content)}`)}
    </main>
    <footer>
      <p>${e(content.brandName)} · ${e(content.city)}</p>
      <p class="legal">${e(content.footerNote)}</p>
      ${renderSocials(content)}
    </footer>
    ${renderWhatsapp(content)}
  </div>`
}

const css = `
.site-reformas{background:var(--bg);color:var(--text)}
.site-reformas .specbar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:0 28px;height:72px;background:#151715;color:#f4f1ea;position:sticky;top:0;z-index:3}
.site-reformas .logo{display:flex;gap:10px;align-items:center;text-decoration:none;font-family:var(--font-display);letter-spacing:.04em;text-transform:uppercase;font-size:1.35rem}
.site-reformas .logo-mark{width:22px;height:22px;background:var(--accent);color:#151715;display:grid;place-items:center;font-family:var(--font-body);font-size:.8rem}
.site-reformas [data-nav]{display:flex;gap:18px}
.site-reformas [data-nav] a{text-decoration:none;font-size:.92rem}
.site-reformas .hero{padding:72px 6vw 36px}
.site-reformas .index{font-family:var(--font-display);letter-spacing:.14em;text-transform:uppercase}
.site-reformas h1{font-family:var(--font-display);font-weight:650;font-size:clamp(4rem,9vw,7.4rem);line-height:.84;letter-spacing:-.03em;text-transform:uppercase;max-width:12ch;margin-top:12px}
.site-reformas .lede{max-width:46ch;font-size:1.2rem;margin-top:18px}
.site-reformas .actions{display:flex;gap:18px;align-items:center;margin-top:24px}
.site-reformas .btn{background:var(--accent);color:var(--on-accent);text-decoration:none;padding:14px 18px;font-weight:650}
.site-reformas .textlink{text-underline-offset:4px}
.site-reformas .service-index article{display:grid;grid-template-columns:90px 1fr 1fr;gap:20px;align-items:baseline;padding:28px 6vw;border-top:1px solid #d9d4c8}
.site-reformas .service-index span{font-family:var(--font-display);font-size:2rem}
.site-reformas .service-index h2{font-family:var(--font-display);font-size:clamp(2rem,4vw,3.4rem);text-transform:uppercase;line-height:.9}
.site-reformas .cases{padding:64px 6vw}
.site-reformas .case-row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(260px,1fr);gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}
.site-reformas .case-row article{scroll-snap-align:start;min-height:280px;background:#151715;color:#f4f1ea;padding:22px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px}
.site-reformas .case-row h3{font-family:var(--font-display);font-size:2.2rem;text-transform:uppercase;line-height:.9}
.site-reformas .compare-section{padding:20px 6vw 70px}
.site-reformas .compare-frame{container-type:inline-size;position:relative;height:460px;background:#d7d2c6;overflow:hidden}
.site-reformas .shot{position:absolute;inset:0}
.site-reformas .shot svg,.site-reformas .shot img{width:100%;height:100%;object-fit:cover}
.site-reformas .shot-after{overflow:hidden;border-right:3px solid #151715}
.site-reformas .shot-inner{width:100cqi;height:100%;position:relative}
.site-reformas .shot span{position:absolute;left:12px;bottom:12px;background:#151715;color:#fff;padding:4px 8px}
.site-reformas .compare label{display:block;margin-top:12px}
.site-reformas .compare input{width:min(420px,100%)}
.site-reformas .zones{padding:40px 6vw 70px;display:grid;grid-template-columns:.8fr 1.2fr;gap:28px}
.site-reformas .zone-map{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.site-reformas .zone-map span{background:#151715;color:#f4f1ea;min-height:110px;display:flex;align-items:flex-end;padding:12px;font-family:var(--font-display);text-transform:uppercase;font-size:1.4rem;line-height:.95}
.site-reformas .process{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #151715}
.site-reformas .process article{padding:28px 22px;border-right:1px solid #151715;min-height:180px}
.site-reformas .process strong{display:block;font-family:var(--font-display);font-size:2rem;text-transform:uppercase}
.site-reformas .quote{padding:64px 6vw;background:#151715;color:#f4f1ea}
.site-reformas .quotes{padding:64px 6vw}
.site-reformas .block-quotes{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.site-reformas blockquote{font-size:1.25rem}
.site-reformas footer{padding:28px 6vw 80px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;background:var(--accent);color:#151715}
.site-reformas h2{font-family:var(--font-display);font-size:clamp(2.4rem,5vw,4rem);text-transform:uppercase;line-height:.9;margin-bottom:16px}
@media (max-width:900px){
  .site-reformas .service-index article,.site-reformas .zones,.site-reformas .process,.site-reformas .block-quotes{grid-template-columns:1fr}
  .site-reformas .process article{border-right:0;border-bottom:1px solid #151715}
  .site-reformas .compare-frame{height:300px}
}
@media (max-width:640px){
  .site-reformas h1{font-size:3.2rem}
  .site-reformas .zone-map{grid-template-columns:1fr 1fr}
  .site-reformas .specbar{height:auto;padding:16px}
}
`

export const reformas: TemplateDefinition = {
  id: 'reformas',
  name: 'Reformas',
  sector: 'Reformas y obra',
  summary: 'Servicios en filas numeradas, obras, comparador y zonas de actuación.',
  composition: 'Índice de servicios a ancho completo, casos en desplazamiento horizontal y comparador antes/después.',
  navigation: 'Barra negra fija con enlaces en línea, distinta de una portada editorial.',
  typography: 'Titulares condensados en mayúscula y cuerpo neutro.',
  defaultFont: 'industrial',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Obradores del Turia',
      logoText: 'Obradores',
      tagline: 'Reformas integrales con oficio',
      about: 'Actuamos en vivienda y local comercial. Cada obra de esta web es un caso ficticio de demostración.',
      seoTitle: 'Obradores del Turia · reformas',
      seoDescription: 'Web de demostración para una empresa de reformas: servicios, proyectos, antes y después, zonas y presupuesto.',
      phone: '+34 600 000 102',
      whatsapp: '+34 600 000 102',
      email: 'hola@obradoresdelturia.invalid',
      address: 'Calle del Yeso 7',
      city: 'Valencia',
      postalCode: '46011',
      fontPair: 'industrial',
      colors: {
        primary: '#151715',
        secondary: '#4e564f',
        accent: '#d6f25c',
        background: '#f3f0e8',
        surface: '#fffdf8',
        text: '#151715',
      },
      hero: {
        kicker: 'Empresa de demostración',
        title: 'Obra clara,\nsin sorpresas',
        subtitle: 'Reforma integral, cocina y baño. Un solo interlocutor desde la visita hasta la entrega de llaves.',
        cta: 'Pedir presupuesto',
        ctaHref: '#presupuesto',
        secondaryCta: 'Ver servicios',
        secondaryHref: '#servicios',
        image: '',
      },
      services: [
        { id: 'sv1', title: 'Reforma integral', description: 'Distribución, instalaciones y acabados de una vivienda completa.', price: '', meta: 'Vivienda' },
        { id: 'sv2', title: 'Cocina y baño', description: 'Demolición, fontanería, electricidad y mobiliario de obra.', price: '', meta: 'Estancias' },
        { id: 'sv3', title: 'Local comercial', description: 'Adecuación de local, mostrador y normativa básica de actividad.', price: '', meta: 'Negocio' },
        { id: 'sv4', title: 'Mantenimiento', description: 'Pequeñas reparaciones para comunidades y oficinas.', price: '', meta: 'Continuidad' },
      ],
      cases: [
        { id: 'c1', title: 'Vivienda en el Cabanyal', location: 'Caso ficticio', summary: 'Se abrió la cocina al estar y se renovaron dos baños. Duración de referencia: 14 semanas.' },
        { id: 'c2', title: 'Estudio con altillo', location: 'Caso ficticio', summary: 'Un piso de 42 m² con almacenamiento a medida y suelo continuo.' },
        { id: 'c3', title: 'Mostrador de barrio', location: 'Caso ficticio', summary: 'Local de 60 m² con barra, almacén y aseo adaptado.' },
      ],
      gallery: [
        { id: 'g1', alt: 'Estancia vacía antes de la reforma', caption: 'Antes', image: '', tone: '#8d8474' },
        { id: 'g2', alt: 'Estancia terminada después de la reforma', caption: 'Después', image: '', tone: '#d6f25c' },
      ],
      zones: ['Campanar', 'Ruzafa', 'Benimaclet', 'El Carmen', 'Patraix', 'Cuenca norte'],
      stats: [
        { id: 'p1', label: 'Visita', value: 'Medimos y escuchamos' },
        { id: 'p2', label: 'Propuesta', value: 'Partidas claras' },
        { id: 'p3', label: 'Obra', value: 'Un responsable' },
        { id: 'p4', label: 'Entrega', value: 'Repaso contigo' },
      ],
      testimonials: [
        { id: 't1', quote: 'Nos explicaron cada partida antes de picar.', name: 'Vecino de demostración', role: 'Nota ficticia' },
        { id: 't2', quote: 'La cocina quedó usable en la fecha que habíamos hablado.', name: 'Cliente de demostración', role: 'Nota ficticia' },
      ],
      form: {
        title: 'Pedir presupuesto',
        intro: 'Cuéntanos el tipo de obra. La solicitud no sale de este dispositivo.',
        submitLabel: 'Enviar solicitud',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'email', name: 'email', label: 'Correo', type: 'email', required: false, options: [] },
          { id: 'tipo', name: 'tipo', label: 'Tipo de obra', type: 'select', required: true, options: ['Reforma integral', 'Cocina', 'Baño', 'Local'] },
          { id: 'mensaje', name: 'mensaje', label: 'Qué necesitas', type: 'textarea', required: true, options: [] },
        ],
      },
      socials: [{ id: 's1', network: 'Instagram', url: 'https://ejemplo.invalid/obradores' }],
      hours: [
        { id: 'h1', day: 'Lunes a viernes', hours: '08:30–18:30' },
        { id: 'h2', day: 'Sábado', hours: '09:00–13:00' },
      ],
      footerNote: 'Datos ficticios de demostración. Obradores del Turia no es una empresa real.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
