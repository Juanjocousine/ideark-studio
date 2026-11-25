/**
 * Contratos preparados para cuando existan las especificaciones oficiales.
 * Studio guarda identificadores locales y no consulta ningún servicio.
 */
export const IDEARK_SYSTEMS = [
  {
    id: 'comercial',
    system: 'ideark-comercial',
    label: 'Ideark Comercial',
    responsibility: 'Clientes, oportunidades y ventas.',
  },
  {
    id: 'experience',
    system: 'ideark-experience',
    label: 'Ideark Experience',
    responsibility: 'Catálogo y configuraciones comerciales.',
  },
  {
    id: 'central',
    system: 'ideark-central',
    label: 'Ideark Central',
    responsibility: 'Control económico.',
  },
  {
    id: 'radar',
    system: 'ideark-radar',
    label: 'Ideark Radar',
    responsibility: 'Contrato oficial pendiente de definición.',
  },
] as const

export type IdearkSystemId = (typeof IDEARK_SYSTEMS)[number]['id']

export type ExternalRefs = Record<IdearkSystemId, string>
