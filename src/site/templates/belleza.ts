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
  renderQuotes,
  safeHref,
  renderTeam,
  renderWhatsapp,
  rich,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'inicio', label: 'Inicio', group: 'hero', nav: true },
  { id: 'tratamientos', label: 'Tratamientos', group: 'services', nav: true },
  { id: 'tarifas', label: 'Tarifas', group: 'services', nav: true },
  { id: 'galeria', label: 'Galería', group: 'gallery', nav: true },
  { id: 'equipo', label: 'Equipo', group: 'team' },
  { id: 'reservas', label: 'Reservas', group: 'form', nav: true },
  { id: 'testimonios', label: 'Testimonios', group: 'testimonials' },
]

function body(content: Parameters<TemplateDefinition['renderBody']>[0]): string {
  const links = navLinks(sections, content)
  return `<div class="site site-belleza">
    <p class="spine" aria-hidden="true">${e(content.logoText || content.brandName)}</p>
    <div class="sheet">
      <header>
        ${renderLogo(content)}
        ${navToggle()}
        ${content.hero.cta ? `<a class="book" href="${e(safeHref(content.hero.ctaHref, '#reservas'))}">${e(content.hero.cta)}</a>` : ''}
      </header>
      <nav aria-label="Secciones" data-nav>${links}</nav>
      <main id="contenido">
        ${block(
          content,
          'inicio',
          'hero',
          `<p class="kicker">${e(content.hero.kicker)}</p>
          <h1>${rich(content.hero.title)}</h1>
          <div class="hero-frame">${media({ alt: content.tagline, image: content.hero.image, tone: content.colors.secondary }, 2)}</div>
          <p class="lede">${e(content.hero.subtitle)}</p>`,
        )}
        ${block(
          content,
          'tratamientos',
          'treatments',
          `<h2>Tratamientos</h2><div class="scroll">${content.services
            .map((service) => `<article><h3>${e(service.title)}</h3><p>${e(service.description)}</p><em>${e(service.meta)}</em></article>`)
            .join('')}</div>`,
        )}
        ${block(
          content,
          'tarifas',
          'prices',
          `<div class="price-sheet"><h2>Tarifas</h2><ul>${content.services
            .map((service) => `<li><span>${e(service.title)}</span><strong>${e(service.price)}</strong></li>`)
            .join('')}</ul></div>`,
        )}
        ${block(
          content,
          'galeria',
          'film',
          `<h2>El espacio</h2><div class="filmstrip">${content.gallery
            .map((item, index) => `<figure>${media(item, index)}<figcaption>${e(item.caption)}</figcaption></figure>`)
            .join('')}</div>`,
        )}
        ${block(content, 'equipo', 'team', `<h2>Equipo</h2>${renderTeam(content)}`)}
        ${block(content, 'reservas', 'booking', `${renderForm(content)}${renderMap(content)}`)}
        ${block(content, 'testimonios', 'quotes', `<h2>Notas</h2>${renderQuotes(content)}`)}
      </main>
      <footer><p class="legal">${e(content.footerNote)}</p></footer>
      ${renderWhatsapp(content)}
    </div>
  </div>`
}

const css = `
.site-belleza{display:grid;grid-template-columns:54px 1fr;min-height:100vh;background:#1a1214;color:#f7f1ee}
.site-belleza .spine{writing-mode:vertical-rl;transform:rotate(180deg);display:grid;place-items:center;letter-spacing:.42em;text-transform:uppercase;font-size:.78rem}
.site-belleza .sheet{background:var(--bg);color:var(--text);min-height:100vh}
.site-belleza header{display:flex;justify-content:space-between;align-items:center;padding:22px 6vw 0}
.site-belleza .logo{font-family:var(--font-display);font-size:2rem;text-decoration:none;letter-spacing:.08em}
.site-belleza .logo-mark,.site-belleza .logo span{font-family:var(--font-display)}
.site-belleza .logo-mark{display:none}
.site-belleza .book{text-decoration:none;border:1px solid var(--primary);padding:8px 14px}
.site-belleza [data-nav]{display:flex;gap:18px;padding:14px 6vw 0}
.site-belleza [data-nav] a{text-decoration:none}
.site-belleza .hero{display:grid;grid-template-columns:1fr .8fr;gap:24px;align-items:end;padding:6vh 6vw 4vh}
.site-belleza h1{font-family:var(--font-display);font-weight:400;font-size:clamp(4.6rem,10vw,8.5rem);line-height:.82;letter-spacing:-.03em}
.site-belleza .kicker{letter-spacing:.18em;text-transform:uppercase;font-size:.72rem}
.site-belleza .hero-frame{transform:translateY(-24px);border:10px solid #fff}
.site-belleza .hero-frame svg,.site-belleza .hero-frame img{height:360px;width:100%;object-fit:cover}
.site-belleza .lede{grid-column:1;max-width:36ch}
.site-belleza .treatments,.site-belleza .film,.site-belleza .team,.site-belleza .booking,.site-belleza .quotes{padding:28px 6vw 10px}
.site-belleza h2{font-family:var(--font-display);font-size:clamp(2.4rem,5vw,4rem);font-weight:400;margin-bottom:16px}
.site-belleza .scroll{display:grid;grid-auto-flow:column;grid-auto-columns:240px;gap:12px;overflow-x:auto}
.site-belleza .scroll article{min-height:220px;padding:16px;background:#fff;display:flex;flex-direction:column;justify-content:space-between}
.site-belleza .scroll h3{font-family:var(--font-display);font-size:2rem;font-weight:400}
.site-belleza .prices{display:flex;justify-content:center;padding:48px 6vw}
.site-belleza .price-sheet{width:min(520px,100%);background:#fffaf7;border:1px solid var(--primary);outline:1px solid var(--primary);outline-offset:8px;padding:36px 32px;transform:rotate(-1.5deg)}
.site-belleza .price-sheet li{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--text) 15%,transparent);list-style:none}
.site-belleza .price-sheet ul{margin:0;padding:0}
.site-belleza .filmstrip{display:flex;gap:10px;overflow-x:auto}
.site-belleza .filmstrip figure{min-width:220px}
.site-belleza .filmstrip svg,.site-belleza .filmstrip img{height:280px;width:220px;object-fit:cover}
.site-belleza .block-team{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.site-belleza .avatar{font-family:var(--font-display);font-size:2rem}
.site-belleza .block-quotes{display:grid;gap:18px}
.site-belleza blockquote{font-family:var(--font-display);font-size:2rem;line-height:1.05}
.site-belleza footer{padding:32px 6vw 80px}
.site-belleza .legal{max-width:58ch;color:var(--secondary)}
@media (max-width:900px){
  .site-belleza{grid-template-columns:1fr}
  .site-belleza .spine{writing-mode:horizontal-tb;transform:none;padding:10px 16px;letter-spacing:.2em}
  .site-belleza .hero{grid-template-columns:1fr}
  .site-belleza .hero-frame{transform:none}
  .site-belleza .price-sheet{transform:none}
}
@media (max-width:640px){
  .site-belleza h1{font-size:3.4rem}
  .site-belleza .block-team{grid-template-columns:1fr}
}
`

export const belleza: TemplateDefinition = {
  id: 'belleza',
  name: 'Belleza',
  sector: 'Belleza',
  summary: 'Tratamientos en cinta, tarifas como carta impresa y reserva.',
  composition: 'Marca vertical fija, titular gigante descentrado y lista de precios sobre papel.',
  navigation: 'Enlaces en una segunda línea, con la reserva separada del menú.',
  typography: 'Display de moda, de una sola caja, y cuerpo sans.',
  defaultFont: 'atelier',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Taller Amina',
      logoText: 'Amina',
      tagline: 'Peluquería y color',
      about: 'Un taller pequeño de corte y color. Los precios son de demostración.',
      seoTitle: 'Taller Amina · peluquería',
      seoDescription: 'Web de demostración de una peluquería: tratamientos, tarifas, galería y reservas. Datos ficticios.',
      phone: '+34 600 000 104',
      whatsapp: '+34 600 000 104',
      email: 'hola@talleramina.invalid',
      address: 'Carrer de la Seda 21',
      city: 'Valencia',
      postalCode: '46001',
      fontPair: 'atelier',
      colors: {
        primary: '#241316',
        secondary: '#8d5d66',
        accent: '#241316',
        background: '#f6efe9',
        surface: '#fffaf7',
        text: '#241316',
      },
      hero: {
        kicker: 'Peluquería de demostración',
        title: 'Corte,\ncolor, calma',
        subtitle: 'Citas de una hora. Color, corte y tratamientos de brillo en un taller de barrio.',
        cta: 'Reservar',
        ctaHref: '#reservas',
        secondaryCta: 'Tarifas',
        secondaryHref: '#tarifas',
        image: '',
      },
      services: [
        { id: 'sv1', title: 'Corte', description: 'Lavado, corte y peinado corto.', price: '32 €', meta: '45 min' },
        { id: 'sv2', title: 'Color', description: 'Color completo con un tono de la casa.', price: '68 €', meta: '2 h' },
        { id: 'sv3', title: 'Mechas', description: 'Mechas abiertas o balayage suave.', price: '92 €', meta: '2 h 30' },
        { id: 'sv4', title: 'Ritual de brillo', description: 'Tratamiento sin amoniaco para el día del evento.', price: '40 €', meta: '40 min' },
      ],
      gallery: [
        { id: 'g1', alt: 'Sillón de peluquería ilustrado', caption: 'El sillón', image: '', tone: '#e7c3b8' },
        { id: 'g2', alt: 'Espejo de marco fino', caption: 'Espejo', image: '', tone: '#8d5d66' },
        { id: 'g3', alt: 'Detalle de color en un cuenco', caption: 'Color', image: '', tone: '#241316' },
      ],
      team: [
        { id: 'p1', name: 'Amina Costa', role: 'Color · personaje ficticio', bio: 'Figura de demostración. No es una profesional real.' },
        { id: 'p2', name: 'Leo Prat', role: 'Corte · personaje ficticio', bio: 'Figura de demostración para la ficha de equipo.' },
      ],
      testimonials: [
        { id: 't1', quote: 'Salí con el color que había pedido, sin prisas.', name: 'Cliente de demostración', role: 'Nota ficticia' },
      ],
      form: {
        title: 'Reservar hora',
        intro: 'Elige tratamiento y una fecha orientativa. La reserva no queda confirmada.',
        submitLabel: 'Pedir hora',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'fecha', name: 'fecha', label: 'Fecha', type: 'date', required: true, options: [] },
          { id: 'tratamiento', name: 'tratamiento', label: 'Tratamiento', type: 'select', required: true, options: ['Corte', 'Color', 'Mechas', 'Ritual de brillo'] },
        ],
      },
      hours: [
        { id: 'h1', day: 'Martes a viernes', hours: '10:00–19:30' },
        { id: 'h2', day: 'Sábado', hours: '09:30–14:00' },
      ],
      footerNote: 'Datos ficticios de demostración. Taller Amina no es un centro real.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
