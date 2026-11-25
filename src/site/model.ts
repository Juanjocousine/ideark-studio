export const TEMPLATE_IDS = [
  'restaurante',
  'reformas',
  'clinica',
  'belleza',
  'servicios',
  'industria',
] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]

export const FONT_PAIRS = {
  editorial: {
    label: 'Editorial — Fraunces y Outfit',
    display: 'Fraunces',
    body: 'Outfit',
    displayFallback: 'Georgia, serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Fraunces:ital,opsz,wght@0,9..144,560;1,9..144,520&family=Outfit:wght@340;460;560',
  },
  industrial: {
    label: 'Industrial — Barlow Condensed y Source Sans 3',
    display: 'Barlow Condensed',
    body: 'Source Sans 3',
    displayFallback: '"Arial Narrow", Impact, sans-serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@360;450;600',
  },
  sereno: {
    label: 'Sereno — Cormorant Garamond y Manrope',
    display: 'Cormorant Garamond',
    body: 'Manrope',
    displayFallback: 'Palatino, Georgia, serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600',
  },
  atelier: {
    label: 'Atelier — Italiana y Manrope',
    display: 'Italiana',
    body: 'Manrope',
    displayFallback: 'Palatino, Georgia, serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Italiana&family=Manrope:wght@400;500;600',
  },
  estudio: {
    label: 'Estudio — Libre Baskerville y Schibsted Grotesk',
    display: 'Libre Baskerville',
    body: 'Schibsted Grotesk',
    displayFallback: 'Georgia, serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Schibsted+Grotesk:wght@400;500;600',
  },
  tecnico: {
    label: 'Técnico — Space Grotesk e IBM Plex Sans',
    display: 'Space Grotesk',
    body: 'IBM Plex Sans',
    displayFallback: 'system-ui, sans-serif',
    bodyFallback: 'system-ui, sans-serif',
    google: 'Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600',
  },
} as const

export type FontPairId = keyof typeof FONT_PAIRS

export type EditorGroup =
  | 'hero'
  | 'about'
  | 'menu'
  | 'daily'
  | 'services'
  | 'gallery'
  | 'compare'
  | 'team'
  | 'faq'
  | 'testimonials'
  | 'hours'
  | 'form'
  | 'cases'
  | 'zones'
  | 'stats'
  | 'contact'

export type SectionDef = {
  id: string
  label: string
  group: EditorGroup
  nav?: boolean
}

export type HoursRow = { id: string; day: string; hours: string }
export type SocialLink = { id: string; network: string; url: string }
export type ServiceItem = { id: string; title: string; description: string; price: string; meta: string }
export type GalleryItem = { id: string; alt: string; caption: string; image: string; tone: string }
export type TeamMember = { id: string; name: string; role: string; bio: string }
export type FaqItem = { id: string; q: string; a: string }
export type Testimonial = { id: string; quote: string; name: string; role: string }
export type MenuItem = { id: string; group: string; name: string; description: string; price: string }
export type CaseItem = { id: string; title: string; location: string; summary: string }
export type StatItem = { id: string; label: string; value: string }
export type FormField = {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select'
  required: boolean
  options: string[]
}

export type Palette = {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
}

export type SiteContent = {
  brandName: string
  logoText: string
  logoImage: string
  tagline: string
  about: string
  seoTitle: string
  seoDescription: string
  phone: string
  whatsapp: string
  email: string
  address: string
  city: string
  postalCode: string
  hours: HoursRow[]
  socials: SocialLink[]
  colors: Palette
  fontPair: FontPairId
  sections: Record<string, boolean>
  hero: {
    kicker: string
    title: string
    subtitle: string
    cta: string
    ctaHref: string
    secondaryCta: string
    secondaryHref: string
    image: string
  }
  services: ServiceItem[]
  gallery: GalleryItem[]
  testimonials: Testimonial[]
  team: TeamMember[]
  faqs: FaqItem[]
  menu: MenuItem[]
  dailyMenu: { name: string; price: string; courses: string[] }
  cases: CaseItem[]
  zones: string[]
  stats: StatItem[]
  form: { title: string; intro: string; submitLabel: string; note: string; fields: FormField[] }
  footerNote: string
}

export type TemplateDefinition = {
  id: TemplateId
  name: string
  sector: string
  summary: string
  composition: string
  navigation: string
  typography: string
  futureNote?: string
  defaultFont: FontPairId
  sections: SectionDef[]
  createContent: () => SiteContent
  renderBody: (content: SiteContent) => string
  renderCss: () => string
}

const FIELD_TYPES = new Set<FormField['type']>(['text', 'email', 'tel', 'date', 'textarea', 'select'])

export function isFontPair(value: string): value is FontPairId {
  return Object.prototype.hasOwnProperty.call(FONT_PAIRS, value)
}

export function normalizeHex(input: string | undefined | null): string | null {
  const value = (input ?? '').trim()
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase()}`
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase()
  return null
}

export function safeName(value: string): string {
  const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  return clean || 'campo'
}

export function defineContent(
  partial: Partial<SiteContent> & Pick<SiteContent, 'brandName' | 'colors' | 'fontPair'>,
): SiteContent {
  const baseForm = {
    title: 'Contacto',
    intro: '',
    submitLabel: 'Enviar',
    note: 'La solicitud se registra en este dispositivo y no se envía a ningún servidor.',
    fields: [
      { id: 'nombre', name: 'nombre', label: 'Nombre', type: 'text' as const, required: true, options: [] },
      { id: 'telefono', name: 'telefono', label: 'Teléfono', type: 'tel' as const, required: true, options: [] },
      { id: 'email', name: 'email', label: 'Correo', type: 'email' as const, required: false, options: [] },
      { id: 'mensaje', name: 'mensaje', label: 'Mensaje', type: 'textarea' as const, required: true, options: [] },
    ],
  }
  const baseHero = {
    kicker: '',
    title: partial.brandName,
    subtitle: '',
    cta: 'Contactar',
    ctaHref: '#contacto',
    secondaryCta: '',
    secondaryHref: '#servicios',
    image: '',
  }
  return {
    logoText: partial.brandName,
    logoImage: '',
    tagline: '',
    about: '',
    seoTitle: partial.brandName,
    seoDescription: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    hours: [],
    socials: [],
    sections: {},
    services: [],
    gallery: [],
    testimonials: [],
    team: [],
    faqs: [],
    menu: [],
    cases: [],
    zones: [],
    stats: [],
    footerNote: '',
    ...partial,
    colors: partial.colors,
    hero: { ...baseHero, ...partial.hero },
    form: {
      ...baseForm,
      ...partial.form,
      fields: (partial.form?.fields ?? baseForm.fields).map((field) => ({
        ...field,
        type: FIELD_TYPES.has(field.type) ? field.type : 'text',
        name: safeName(field.name),
        options: field.options ?? [],
      })),
    },
    dailyMenu: { name: '', price: '', courses: [], ...partial.dailyMenu },
  }
}

export function normalizeContent(template: TemplateDefinition, content: SiteContent): SiteContent {
  const sections = { ...content.sections }
  for (const section of template.sections) {
    if (typeof sections[section.id] !== 'boolean') sections[section.id] = true
  }
  const fallback = content.colors
  const pick = (value: string | undefined, fallbackColor: string) => normalizeHex(value) ?? fallbackColor
  return {
    ...content,
    fontPair: isFontPair(content.fontPair) ? content.fontPair : template.defaultFont,
    sections,
    colors: {
      primary: pick(fallback?.primary, '#222222'),
      secondary: pick(fallback?.secondary, '#666666'),
      accent: pick(fallback?.accent, '#c4552a'),
      background: pick(fallback?.background, '#ffffff'),
      surface: pick(fallback?.surface, '#ffffff'),
      text: pick(fallback?.text, '#161513'),
    },
  }
}
