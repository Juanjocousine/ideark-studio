import { defineContent, type SectionDef, type SiteContent, type TemplateDefinition } from '../model'
import {
  block,
  e,
  media,
  navLinks,
  navToggle,
  renderFaq,
  renderForm,
  renderHours,
  renderLogo,
  safeHref,
  renderMap,
  renderQuotes,
  renderSocials,
  renderWhatsapp,
  rich,
  telHref,
} from '../shared'

const sections: SectionDef[] = [
  { id: 'inicio', label: 'Inicio', group: 'hero', nav: true },
  { id: 'carta', label: 'Carta', group: 'menu', nav: true },
  { id: 'menu-dia', label: 'Menú del día', group: 'daily', nav: true },
  { id: 'galeria', label: 'Galería', group: 'gallery', nav: true },
  { id: 'horarios', label: 'Horarios', group: 'hours', nav: true },
  { id: 'reservas', label: 'Reservas', group: 'form', nav: true },
  { id: 'testimonios', label: 'Testimonios', group: 'testimonials' },
  { id: 'preguntas', label: 'Preguntas', group: 'faq' },
]

function menuBoard(content: SiteContent): string {
  const groups = new Map<string, typeof content.menu>()
  for (const item of content.menu) {
    const list = groups.get(item.group) ?? []
    list.push(item)
    groups.set(item.group, list)
  }
  return [...groups.entries()]
    .map(
      ([group, items]) => `<div class="menu-group">
        <h3>${e(group)}</h3>
        ${items
          .map(
            (item) => `<article>
              <div><h4>${e(item.name)}</h4><p>${e(item.description)}</p></div>
              <strong>${e(item.price)}</strong>
            </article>`,
          )
          .join('')}
      </div>`,
    )
    .join('')
}

function body(content: SiteContent): string {
  const links = navLinks(sections, content)
  return `<div class="site site-restaurante">
    <header class="top">
      ${renderLogo(content)}
      ${navToggle()}
      <nav aria-label="Secciones" data-nav>${links}</nav>
    </header>
    <main id="contenido">
      ${block(
        content,
        'inicio',
        'hero',
        `<div class="hero-copy">
          <p class="kicker">${e(content.hero.kicker)}</p>
          <h1>${rich(content.hero.title)}</h1>
          <p class="lede">${e(content.hero.subtitle)}</p>
          <div class="actions">
            ${content.hero.cta ? `<a class="btn" href="${e(safeHref(content.hero.ctaHref, '#reservas'))}">${e(content.hero.cta)}</a>` : ''}
            ${content.hero.secondaryCta ? `<a class="btn ghost" href="${e(safeHref(content.hero.secondaryHref, '#carta'))}">${e(content.hero.secondaryCta)}</a>` : ''}
          </div>
        </div>
        <aside class="tonight">
          <p>Esta noche</p>
          ${media({ alt: content.hero.subtitle || content.brandName, image: content.hero.image, tone: content.colors.accent }, 3)}
          <strong>${e(content.tagline)}</strong>
        </aside>`,
      )}
      ${block(content, 'carta', 'menu-board', `<p class="kicker">Carta</p><h2>Lo que sale de la cocina</h2>${menuBoard(content)}`)}
      ${block(
        content,
        'menu-dia',
        'day',
        `<div class="day-ticket">
          <p class="kicker">${e(content.dailyMenu.name)}</p>
          <h2>${e(content.dailyMenu.price)}</h2>
          <ol>${content.dailyMenu.courses.map((course) => `<li>${e(course)}</li>`).join('')}</ol>
          <p>Incluye pan, bebida y café. La composición cambia con el mercado.</p>
        </div>`,
      )}
      ${block(
        content,
        'galeria',
        'gallery',
        `<h2>La sala y el pase</h2><div class="frames">${content.gallery
          .map(
            (item, index) => `<figure>${media(item, index)}<figcaption>${e(item.caption)}</figcaption></figure>`,
          )
          .join('')}</div>`,
      )}
      ${block(
        content,
        'horarios',
        'hours-split',
        `<div><p class="kicker">Visítanos</p><h2>Horarios</h2>${renderHours(content)}<p><a href="${telHref(content.phone)}">${e(content.phone)}</a></p></div>
         <div class="address-card">${renderMap(content)}${renderSocials(content)}</div>`,
      )}
      ${block(content, 'reservas', 'booking', renderForm(content))}
      ${block(content, 'testimonios', 'quotes', `<h2>Notas de la sala</h2>${renderQuotes(content)}`)}
      ${block(content, 'preguntas', 'faq', `<h2>Antes de venir</h2>${renderFaq(content)}`)}
    </main>
    <footer>
      <p class="footer-brand">${e(content.brandName)}</p>
      <p class="legal">${e(content.footerNote)}</p>
    </footer>
    ${renderWhatsapp(content)}
  </div>`
}

const css = `
.site-restaurante{background:var(--bg);color:var(--text)}
.site-restaurante .top{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px 7vw;position:absolute;inset:0 0 auto 0;z-index:2}
.site-restaurante .logo{display:flex;gap:10px;align-items:center;text-decoration:none;font-family:var(--font-display);font-size:1.3rem}
.site-restaurante .logo-mark{width:28px;height:28px;display:grid;place-items:center;border:1px solid currentColor;border-radius:50%}
.site-restaurante [data-nav]{display:flex;gap:22px}
.site-restaurante [data-nav] a{text-decoration:none;font-size:.92rem}
.site-restaurante .hero{min-height:100vh;display:grid;grid-template-columns:1.3fr .7fr;gap:40px;align-items:end;padding:22vh 7vw 10vh}
.site-restaurante h1{font-family:var(--font-display);font-weight:520;font-size:clamp(4.4rem,9vw,8rem);line-height:.86;letter-spacing:-.04em}
.site-restaurante .kicker{letter-spacing:.18em;text-transform:uppercase;font-size:.75rem;color:var(--secondary)}
.site-restaurante .lede{max-width:38ch;font-size:1.15rem;margin-top:18px}
.site-restaurante .actions{display:flex;gap:12px;margin-top:28px}
.site-restaurante .btn{background:var(--accent);color:var(--on-accent);text-decoration:none;padding:12px 18px}
.site-restaurante .btn.ghost{background:transparent;color:var(--text);border:1px solid color-mix(in srgb,var(--text) 35%,transparent)}
.site-restaurante .tonight{background:var(--surface);padding:18px;display:grid;gap:12px}
.site-restaurante .tonight svg,.site-restaurante .tonight img{height:240px;width:100%;object-fit:cover}
.site-restaurante .menu-board,.site-restaurante .gallery,.site-restaurante .hours-split,.site-restaurante .booking,.site-restaurante .quotes,.site-restaurante .faq{padding:80px 7vw}
.site-restaurante h2{font-family:var(--font-display);font-size:clamp(2.4rem,5vw,4.4rem);font-weight:520;line-height:.95;margin:8px 0 28px}
.site-restaurante .menu-group{margin-top:28px}
.site-restaurante .menu-group h3{font-family:var(--font-display);font-size:1.8rem;font-weight:500;margin-bottom:8px}
.site-restaurante .menu-group article{display:grid;grid-template-columns:1fr auto;gap:24px;padding:14px 0;border-bottom:1px dotted color-mix(in srgb,var(--text) 35%,transparent)}
.site-restaurante .menu-group h4{font-size:1.05rem;font-weight:560}
.site-restaurante .menu-group p{color:var(--secondary)}
.site-restaurante .day{padding:20px 7vw 80px;display:flex;justify-content:center}
.site-restaurante .day-ticket{width:min(440px,100%);background:#f4e7d4;color:#2a2118;padding:36px 32px;background-image:radial-gradient(circle at 0 18px,transparent 10px,#f4e7d4 11px)}
.site-restaurante .day-ticket h2{color:#2a2118}
.site-restaurante .day-ticket ol{margin:18px 0;padding-left:18px;display:grid;gap:8px}
.site-restaurante .frames{display:grid;grid-template-columns:1.4fr .8fr .8fr;gap:12px}
.site-restaurante .frames figure:first-child{grid-row:span 2}
.site-restaurante .frames svg,.site-restaurante .frames img{height:100%;min-height:180px;width:100%;object-fit:cover;background:#2a2118}
.site-restaurante .frames figcaption{margin-top:8px;color:var(--secondary)}
.site-restaurante .hours-split{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.site-restaurante .block-hours div{display:grid;grid-template-columns:1fr auto;gap:12px;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--text) 18%,transparent)}
.site-restaurante .block-hours dl{margin:0}
.site-restaurante .quotes .block-quotes{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.site-restaurante blockquote{font-family:var(--font-display);font-size:1.8rem;line-height:1.15;font-weight:500}
.site-restaurante .faq details{border-top:1px solid color-mix(in srgb,var(--text) 20%,transparent);padding:14px 0}
.site-restaurante footer{padding:40px 7vw 80px}
.site-restaurante .footer-brand{font-family:var(--font-display);font-size:clamp(3rem,8vw,6rem);line-height:.9}
.site-restaurante .legal{max-width:62ch;color:var(--secondary);margin-top:12px}
@media (max-width:900px){
  .site-restaurante .hero,.site-restaurante .hours-split,.site-restaurante .frames,.site-restaurante .quotes .block-quotes{grid-template-columns:1fr}
  .site-restaurante .frames figure:first-child{grid-row:auto}
  .site-restaurante .top{position:static}
  .site-restaurante .hero{min-height:auto;padding-top:48px}
}
@media (max-width:640px){
  .site-restaurante h1{font-size:3.3rem}
  .site-restaurante .menu-group article{grid-template-columns:1fr}
}
`

export const restaurante: TemplateDefinition = {
  id: 'restaurante',
  name: 'Restaurante',
  sector: 'Restauración',
  summary: 'Carta editorial, menú del día en formato de ticket y reservas.',
  composition: 'Hero a sangre con plato del día, carta en columnas con precios y galería asimétrica.',
  navigation: 'Barra superior transparente sobre la portada, que pasa a flujo normal en móvil.',
  typography: 'Titulares serif muy grandes y cuerpo geométrico.',
  futureNote: 'Preparada para una futura integración con ComeCerca. En esta versión no hay conexión.',
  defaultFont: 'editorial',
  sections,
  createContent: () =>
    defineContent({
      brandName: 'Mar de Olivos',
      logoText: 'Mar de Olivos',
      tagline: 'Cocina de mercado junto al agua',
      about: 'Casa de cocina mediterránea. El arroz se hace al momento y la carta cambia con la lonja.',
      seoTitle: 'Mar de Olivos · cocina mediterránea',
      seoDescription: 'Restaurante de demostración con carta, menú del día, galería, horarios y reservas. Datos ficticios.',
      phone: '+34 600 000 101',
      whatsapp: '+34 600 000 101',
      email: 'hola@mardeolivos.invalid',
      address: 'Calle de la Mar 12',
      city: 'Valencia',
      postalCode: '46001',
      fontPair: 'editorial',
      colors: {
        primary: '#f6f1e7',
        secondary: '#e0c39a',
        accent: '#ef6d3c',
        background: '#14110e',
        surface: '#241c16',
        text: '#f6f1e7',
      },
      hero: {
        kicker: 'Valencia · demostración',
        title: 'Fuego,\nmar y arroz',
        subtitle: 'Una casa pequeña para comer despacio. Producto de lonja, huerta y horno de brasa.',
        cta: 'Reservar mesa',
        ctaHref: '#reservas',
        secondaryCta: 'Ver la carta',
        secondaryHref: '#carta',
        image: '',
      },
      menu: [
        { id: 'm1', group: 'Mesa', name: 'Ensalada de hinojo y naranja', description: 'Hinojo crudo, aceituna y aceite nuevo.', price: '14 €' },
        { id: 'm2', group: 'Mesa', name: 'Tartar de gamba roja', description: 'Con aguacate y lima. Ración para compartir.', price: '22 €' },
        { id: 'm3', group: 'Arroz', name: 'Arroz de sepia y alcachofa', description: 'Caldo corto y allioli suave. Mínimo dos personas.', price: '24 €' },
        { id: 'm4', group: 'Arroz', name: 'Arroz a banda', description: 'Pescado de roca y un sofrito largo.', price: '23 €' },
        { id: 'm5', group: 'Brasa', name: 'Dorada a la brasa', description: 'Entera, con ensalada verde.', price: '27 €' },
        { id: 'm6', group: 'Dulce', name: 'Crema de naranja amarga', description: 'Con aceite y sal.', price: '8 €' },
      ],
      dailyMenu: {
        name: 'Menú del día',
        price: '22 €',
        courses: ['Primero de huerta o cuchara', 'Segundo de pescado o brasa', 'Postre de la casa'],
      },
      gallery: [
        { id: 'g1', alt: 'Mesa puesta con mantel de lino', caption: 'La sala, de tarde', image: '', tone: '#c4552a' },
        { id: 'g2', alt: 'Arroz en paella baja', caption: 'Arroz de sepia', image: '', tone: '#e0c39a' },
        { id: 'g3', alt: 'Barra de madera y copas', caption: 'La barra', image: '', tone: '#8c9a72' },
        { id: 'g4', alt: 'Pan y aceite sobre cerámica', caption: 'Para empezar', image: '', tone: '#ef6d3c' },
      ],
      testimonials: [
        { id: 't1', quote: 'El arroz llegó seco y el servicio no nos apuró.', name: 'Cliente de demostración', role: 'Reseña ficticia' },
        { id: 't2', quote: 'Pedimos el menú del día entre semana y repetiríamos el postre.', name: 'Mesa de demostración', role: 'Reseña ficticia' },
      ],
      faqs: [
        { id: 'f1', q: '¿Hace falta reservar?', a: 'Entre semana se puede pasar. Viernes y sábado conviene avisar.' },
        { id: 'f2', q: '¿Tenéis opciones sin gluten?', a: 'El arroz se puede preparar aparte. Avísanos al reservar.' },
        { id: 'f3', q: '¿Se puede celebrar un cumpleaños?', a: 'Sí, en mesas de hasta diez. Escríbenos por el formulario.' },
      ],
      hours: [
        { id: 'h1', day: 'Martes a jueves', hours: '13:30–16:00 · 20:30–23:00' },
        { id: 'h2', day: 'Viernes y sábado', hours: '13:30–16:30 · 20:30–23:30' },
        { id: 'h3', day: 'Domingo', hours: '13:30–16:30' },
        { id: 'h4', day: 'Lunes', hours: 'Cerrado' },
      ],
      socials: [
        { id: 's1', network: 'Instagram', url: 'https://ejemplo.invalid/mardeolivos' },
        { id: 's2', network: 'Mapa', url: 'https://www.openstreetmap.org/search?query=Calle%20de%20la%20Mar%2012%20Valencia' },
      ],
      form: {
        title: 'Reservar mesa',
        intro: 'Cuéntanos día, hora y cuántos seréis. Esto no confirma la mesa: es una solicitud local de demostración.',
        submitLabel: 'Enviar solicitud',
        note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
        fields: [
          { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text', required: true, options: [] },
          { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel', required: true, options: [] },
          { id: 'fecha', name: 'fecha', label: 'Fecha', type: 'date', required: true, options: [] },
          { id: 'mensaje', name: 'mensaje', label: 'Notas', type: 'textarea', required: false, options: [] },
        ],
      },
      footerNote: 'Datos ficticios de demostración. Mar de Olivos no es un restaurante real y no está conectado a ComeCerca.',
      sections: Object.fromEntries(sections.map((section) => [section.id, true])),
    }),
  renderBody: body,
  renderCss: () => css,
}
