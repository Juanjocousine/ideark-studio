import type { TemplateDefinition, TemplateId } from './model'
import { belleza } from './templates/belleza'
import { clinica } from './templates/clinica'
import { industria } from './templates/industria'
import { reformas } from './templates/reformas'
import { restaurante } from './templates/restaurante'
import { servicios } from './templates/servicios'

export const TEMPLATES: TemplateDefinition[] = [restaurante, reformas, clinica, belleza, servicios, industria]

const byId = new Map(TEMPLATES.map((template) => [template.id, template]))

export function getTemplate(id: string): TemplateDefinition {
  const found = byId.get(id as TemplateId)
  if (!found) throw new Error(`Plantilla desconocida: ${id}`)
  return found
}

export function listTemplates(): TemplateDefinition[] {
  return TEMPLATES
}
