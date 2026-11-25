import { onAccent } from './color'
import {
  FONT_PAIRS,
  normalizeHex,
  type FormField,
  type GalleryItem,
  type SectionDef,
  type SiteContent,
} from './model'

export function e(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function on(content: SiteContent, id: string): boolean {
  return content.sections[id] !== false
}

export function block(content: SiteContent, id: string, className: string, inner: string): string {
  if (!on(content, id)) return ''
  return `<section id="${e(id)}" class="${className}">${inner}</section>`
}

export function rich(value: string): string {
  return e(value).replace(/\n/g, '<br> ')
}

export function paragraphs(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${rich(part)}</p>`)
    .join('')
}

export function digits(value: string): string {
  return value.replace(/\D/g, '')
}

export function telHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, '')
  return `tel:${compact}`
}

export function navLinks(sections: SectionDef[], content: SiteContent): string {
  return sections
    .filter((section) => section.nav && on(content, section.id))
    .map((section) => `<a href="#${e(section.id)}">${e(section.label)}</a>`)
    .join('')
}

export function navToggle(): string {
  return `<button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-label="Abrir menú">Menú</button>`
}

export function renderLogo(content: SiteContent): string {
  const text = content.logoText || content.brandName
  const image = content.logoImage
    ? `<img src="${e(content.logoImage)}" alt="">`
    : `<span class="logo-mark" aria-hidden="true">${e(text.slice(0, 1) || 'I')}</span>`
  return `<a class="logo" href="#contenido">${image}<span>${e(text)}</span></a>`
}

const FIELD_TYPES = new Set(['text', 'email', 'tel', 'date'])

export function renderForm(content: SiteContent): string {
  const fields = content.form.fields
    .map((field) => renderField(field))
    .join('')
  return `<form class="block-form" data-site-form novalidate>
    <h2>${e(content.form.title)}</h2>
    <p class="form-intro">${e(content.form.intro)}</p>
    ${fields}
    <button type="submit">${e(content.form.submitLabel || 'Enviar')}</button>
    <p data-form-status role="status"></p>
    <p class="form-note">${e(content.form.note)}</p>
  </form>`
}

function renderField(field: FormField): string {
  const id = `campo-${field.id}`
  const required = field.required ? 'required' : ''
  const star = field.required ? ' (obligatorio)' : ''
  const label = `<label for="${e(id)}">${e(field.label)}${star}</label>`
  if (field.type === 'textarea') {
    return `${label}<textarea id="${e(id)}" name="${e(field.name)}" rows="4" ${required}></textarea>`
  }
  if (field.type === 'select') {
    const options = field.options.filter(Boolean).map((option) => `<option>${e(option)}</option>`).join('')
    return `${label}<select id="${e(id)}" name="${e(field.name)}" ${required}>${options}</select>`
  }
  const type = FIELD_TYPES.has(field.type) ? field.type : 'text'
  const auto =
    field.name === 'nombre' ? 'name' : field.name === 'email' ? 'email' : field.name === 'telefono' ? 'tel' : 'on'
  return `${label}<input id="${e(id)}" name="${e(field.name)}" type="${type}" autocomplete="${auto}" ${required}>`
}

export function renderHours(content: SiteContent): string {
  const rows = content.hours
    .filter((row) => row.day || row.hours)
    .map((row) => `<div><dt>${e(row.day)}</dt><dd>${e(row.hours)}</dd></div>`)
    .join('')
  return `<div class="block-hours"><dl>${rows}</dl></div>`
}

export function renderFaq(content: SiteContent): string {
  const items = content.faqs
    .map(
      (item) => `<details>
        <summary>${e(item.q)}</summary>
        <p>${e(item.a)}</p>
      </details>`,
    )
    .join('')
  return `<div class="block-faq">${items}</div>`
}

export function renderQuotes(content: SiteContent): string {
  const items = content.testimonials
    .map(
      (item) => `<figure>
        <blockquote>${e(item.quote)}</blockquote>
        <figcaption><strong>${e(item.name)}</strong> <span>${e(item.role)}</span></figcaption>
        <p class="fictional-tag">Testimonio ficticio</p>
      </figure>`,
    )
    .join('')
  return `<div class="block-quotes">${items}</div>`
}

export function renderTeam(content: SiteContent): string {
  const items = content.team
    .map(
      (member) => `<li>
        <p class="avatar" aria-hidden="true">${e(member.name.slice(0, 1) || '·')}</p>
        <h3>${e(member.name)}</h3>
        <p class="role">${e(member.role)}</p>
        <p>${e(member.bio)}</p>
      </li>`,
    )
    .join('')
  return `<ul class="block-team">${items}</ul>`
}

export function renderWhatsapp(content: SiteContent): string {
  const number = digits(content.whatsapp)
  if (!number) return ''
  const text = encodeURIComponent(`Hola, escribo desde la web de ${content.brandName}.`)
  return `<a class="wa-float" href="https://wa.me/${number}?text=${text}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`
}

export function renderMap(content: SiteContent): string {
  const query = encodeURIComponent(`${content.address} ${content.postalCode} ${content.city}`.trim())
  return `<div class="block-map">
    <h2>Dónde estamos</h2>
    <p>${e(content.address)}<br>${e(content.postalCode)} ${e(content.city)}</p>
    ${content.phone.trim() ? `<p><a href="${e(telHref(content.phone))}">${e(content.phone)}</a></p>` : ''}
    ${content.email.trim() ? `<p><a href="mailto:${e(content.email)}">${e(content.email)}</a></p>` : ''}
    <p><a href="https://www.openstreetmap.org/search?query=${query}" target="_blank" rel="noopener noreferrer">Abrir el mapa en OpenStreetMap</a></p>
    <p class="form-note">El mapa se abre en un servicio externo. Esta página no incrusta un visor.</p>
  </div>`
}

export function safeHref(value: string, fallback: string): string {
  const href = value.trim()
  if (/^#[A-Za-z0-9_-]+$/.test(href)) return href
  if (/^https?:\/\//i.test(href)) return href
  if (/^(mailto:|tel:)/i.test(href)) return href
  return fallback
}

export function renderSocials(content: SiteContent): string {
  const items = content.socials.filter((item) => item.network && /^https?:\/\//i.test(item.url.trim()))
  if (!items.length) return ''
  return `<ul class="socials">${items
    .map(
      (item) =>
        `<li><a href="${e(item.url)}" target="_blank" rel="noopener noreferrer">${e(item.network)}</a></li>`,
    )
    .join('')}</ul>`
}

export function svgPlate(alt: string, tone: string, variant: number): string {
  const ink = normalizeHex(tone) ?? '#c4a574'
  const shapes = [
    `<circle cx="92" cy="78" r="48" fill="${ink}" opacity=".92"/><circle cx="190" cy="126" r="62" fill="#fff" opacity=".16"/>`,
    `<path d="M0 150 L210 18 L320 96 L320 200 L0 200 Z" fill="${ink}"/><path d="M28 176 L168 42" stroke="#fff" stroke-opacity=".45" stroke-width="10"/>`,
    `<rect x="34" y="26" width="132" height="148" fill="none" stroke="${ink}" stroke-width="12"/><rect x="96" y="68" width="150" height="92" fill="${ink}" opacity=".88"/>`,
    `<path d="M0 128 Q80 36 160 128 T320 120 V200 H0 Z" fill="${ink}" opacity=".9"/>`,
    `<g fill="none" stroke="${ink}" stroke-width="7">${[0, 1, 2, 3, 4, 5]
      .map((index) => `<path d="M${24 + index * 48} 18 V182"/>`)
      .join('')}</g>`,
  ]
  return `<svg role="img" aria-label="${e(alt)}" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#000" fill-opacity=".16"/>${shapes[variant % shapes.length]}</svg>`
}

export function media(item: Pick<GalleryItem, 'alt' | 'image' | 'tone'>, variant: number): string {
  if (item.image) return `<img src="${e(item.image)}" alt="${e(item.alt)}">`
  return svgPlate(item.alt, item.tone, variant)
}

export function cssVariables(content: SiteContent): string {
  const pair = FONT_PAIRS[content.fontPair] ?? FONT_PAIRS.editorial
  const ink = onAccent(content.colors.accent)
  return `:root{
    --primary:${content.colors.primary};
    --secondary:${content.colors.secondary};
    --accent:${content.colors.accent};
    --bg:${content.colors.background};
    --surface:${content.colors.surface};
    --text:${content.colors.text};
    --on-accent:${ink};
    --font-display:"${pair.display}", ${pair.displayFallback};
    --font-body:"${pair.body}", ${pair.bodyFallback};
  }`
}

export const RESET = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.5}
img,svg{max-width:100%;display:block}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer}
a{color:inherit}
h1,h2,h3,h4,p{margin:0}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.skip{position:absolute;left:-999px;top:8px;background:#fff;color:#111;padding:8px 12px;z-index:30}
.skip:focus{left:8px}
.nav-toggle{display:none;background:transparent;border:1px solid currentColor;padding:8px 12px}
.socials,.block-team{list-style:none;padding:0;margin:0}
.form-note,.fictional-tag{font-size:.82rem}
.wa-float{position:fixed;right:16px;bottom:16px;z-index:6;padding:12px 16px;text-decoration:none;background:var(--accent);color:var(--on-accent)}
.block-form{display:grid;gap:8px}
.block-form input,.block-form textarea,.block-form select{width:100%;padding:12px 14px;border:1px solid color-mix(in srgb,var(--text) 25%,transparent);background:transparent}
.block-form button{justify-self:start;border:0;background:var(--accent);color:var(--on-accent);padding:12px 18px}
.fictional-tag{letter-spacing:.08em;text-transform:uppercase}
@media (max-width:780px){
  .nav-toggle{display:inline-flex}
  [data-nav]{display:none !important}
  [data-nav].is-open{
    display:flex !important;flex-direction:column;align-items:flex-start;gap:14px;
    position:fixed;z-index:30;top:0;left:0;right:0;padding:72px 7vw 24px;
    background:var(--bg);color:var(--text);
    border-bottom:1px solid color-mix(in srgb,var(--text) 22%,transparent);
  }
  [data-nav].is-open a{text-decoration:none;font-size:1.2rem}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{transition:none !important;animation:none !important}
}
`

const BASE_JS = `
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
  }
  document.querySelectorAll('form[data-site-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = form.querySelector('[data-form-status]');
      var missing = false;
      form.querySelectorAll('[required]').forEach(function (field) {
        var value = 'value' in field ? String(field.value || '').trim() : '';
        if (!value) missing = true;
      });
      if (missing) {
        if (status) status.textContent = 'Revisa los campos obligatorios.';
        return;
      }
      if (status) status.textContent = 'Solicitud registrada en este dispositivo. No se ha enviado a ningún servidor.';
      form.reset();
    });
  });
  document.querySelectorAll('[data-compare]').forEach(function (block) {
    var range = block.querySelector('input[type="range"]');
    var after = block.querySelector('[data-after]');
    if (!range || !after) return;
    var sync = function () { after.style.width = range.value + '%'; };
    range.addEventListener('input', sync);
    sync();
  });
})();
`

const PREVIEW_JS = `
/* preview-anchors */
document.addEventListener('click', function (event) {
  var node = event.target;
  if (!node || !node.closest) return;
  var link = node.closest('a[href^="#"]');
  if (!link) return;
  var id = (link.getAttribute('href') || '').slice(1);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return;
  var target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  if (target.scrollIntoView) target.scrollIntoView({ block: 'start' });
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');
  if (nav) nav.classList.remove('is-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
}, true);
window.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type !== 'ideark-scroll' || typeof data.id !== 'string') return;
  if (!/^[A-Za-z0-9_-]+$/.test(data.id)) return;
  var node = document.getElementById(data.id);
  if (node && node.scrollIntoView) node.scrollIntoView({ block: 'start' });
});
`

export function siteJs(preview: boolean): string {
  return preview ? `${BASE_JS}\n${PREVIEW_JS}` : BASE_JS
}

export function assemble(options: {
  content: SiteContent
  body: string
  css: string
  preview: boolean
}): { html: string; css: string; js: string } {
  const pair = FONT_PAIRS[options.content.fontPair] ?? FONT_PAIRS.editorial
  const css = `${cssVariables(options.content)}\n${RESET}\n${options.css}`
  const js = siteJs(options.preview)
  const fontHref = `https://fonts.googleapis.com/css2?family=${pair.google}&amp;display=swap`
  const style = options.preview
    ? `<style>${css}</style>`
    : `<link rel="stylesheet" href="styles.css">`
  const script = options.preview ? `<script>${js}</script>` : `<script src="site.js"></script>`
  const html = `<!DOCTYPE html>
<html lang="es"${options.preview ? ' data-preview="true"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(options.content.seoTitle || options.content.brandName)}</title>
<meta name="description" content="${e(options.content.seoDescription)}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
${style}
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
${options.body}
${script}
</body>
</html>`
  return { html, css, js }
}
