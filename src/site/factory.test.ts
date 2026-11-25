import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { packageSite, previewDocument } from './render'
import { TEMPLATES, getTemplate } from './registry'
import { runQa } from './qa'
import { buildProjectZip } from './zip'
import { createStudioStore, type KeyValueStorage } from '../studio/store'
import { STORAGE_KEY } from '../studio/types'
import { productionSummary } from '../studio/metrics'

const SIGNATURES: Record<string, string[]> = {
  restaurante: ['menu-board', 'day-ticket'],
  reformas: ['service-index', 'data-compare'],
  clinica: ['quiet-center', 'specialty-list'],
  belleza: ['class="spine"', 'price-sheet'],
  servicios: ['chapter-rail', 'service-matrix'],
  industria: ['spec-bar', 'spec-table'],
}

function memory(initial?: string): KeyValueStorage {
  const data = new Map<string, string>()
  if (initial !== undefined) data.set(STORAGE_KEY, initial)
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  }
}

describe('plantillas', () => {
  it('registra seis composiciones distintas', () => {
    expect(TEMPLATES).toHaveLength(6)
    expect(new Set(TEMPLATES.map((template) => template.id)).size).toBe(6)
    expect(new Set(TEMPLATES.map((template) => template.defaultFont)).size).toBe(6)
    const bodies = TEMPLATES.map((template) => previewDocument(template.id, template.createContent()))
    for (const template of TEMPLATES) {
      const html = previewDocument(template.id, template.createContent())
      for (const signature of SIGNATURES[template.id]) expect(html).toContain(signature)
      for (const other of TEMPLATES) {
        if (other.id === template.id) continue
        expect(html).not.toContain(SIGNATURES[other.id][0])
      }
    }
    expect(new Set(bodies).size).toBe(6)
  })

  it('oculta una sección desactivada y no deja su ancla', () => {
    const content = getTemplate('restaurante').createContent()
    content.sections.carta = false
    const html = previewDocument('restaurante', content)
    expect(html).not.toContain('id="carta"')
    expect(html).not.toContain('Tartar de gamba roja')
    expect(html).not.toContain('>Carta</a>')
  })

  it('supera el control de calidad sin errores ni bloqueadores', () => {
    for (const template of TEMPLATES) {
      const content = template.createContent()
      const packed = packageSite(template.id, content)
      const report = runQa({ projectId: template.id, content, html: packed.html, css: packed.css, js: packed.js, files: packed.files, contentRevision: 1 })
      const problems = report.checks.filter((check) => check.severity === 'error' || check.severity === 'blocker')
      expect(problems, template.id).toEqual([])
      expect(report.passed).toBe(true)
      expect(report.checks.some((check) => check.id === 'fictional' && check.severity === 'warning')).toBe(true)
    }
  })

  it('marca como bloqueador un teléfono vacío y un javascript inválido', () => {
    const content = getTemplate('clinica').createContent()
    content.phone = ''
    const packed = packageSite('clinica', content)
    const report = runQa({
      projectId: 'qa',
      content,
      html: packed.html,
      css: packed.css,
      js: 'function {',
      files: packed.files,
    })
    expect(report.checks.find((check) => check.id === 'phone')?.severity).toBe('blocker')
    expect(report.checks.find((check) => check.id === 'javascript')?.severity).toBe('blocker')
    expect(report.passed).toBe(false)
  })
})

describe('exportación', () => {
  it('genera un ZIP con una web independiente para las tres demostraciones', async () => {
    const store = createStudioStore({ storage: memory(), now: () => '2026-11-25T10:00:00.000Z' })
    const demos = store.getState().projects.filter((project) => project.demo)
    expect(demos.map((project) => project.templateId).sort()).toEqual(['clinica', 'reformas', 'restaurante'])
    for (const project of demos) {
      const zip = await buildProjectZip({ name: project.name, templateId: project.templateId, content: project.content })
      const archive = await JSZip.loadAsync(zip.buffer)
      const names = Object.keys(archive.files)
      expect(names.some((name) => name.endsWith('/index.html'))).toBe(true)
      expect(names.some((name) => name.endsWith('/styles.css'))).toBe(true)
      expect(names.some((name) => name.endsWith('/site.js'))).toBe(true)
      expect(names.some((name) => name.endsWith('/LEEME.txt'))).toBe(true)
      const htmlName = names.find((name) => name.endsWith('/index.html'))!
      const html = await archive.files[htmlName].async('string')
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
      expect(html).not.toContain('localhost:5173')
      expect(html).not.toContain('/src/main')
      expect(html).toContain('styles.css')
      expect(html).toContain('site.js')
      const readme = await archive.files[names.find((name) => name.endsWith('/LEEME.txt'))!].async('string')
      expect(readme).toContain('sin Ideark Studio')
      expect(readme).toContain('Google Fonts')
    }
  })

  it('abre la web exportada y ejecuta menú, formulario y comparador', () => {
    const restaurant = previewDocument('restaurante', getTemplate('restaurante').createContent())
    const restaurantDom = new JSDOM(restaurant, { runScripts: 'dangerously', pretendToBeVisual: true })
    const restaurantDocument = restaurantDom.window.document
    expect(restaurantDocument.querySelector('h1')?.textContent).toContain('mar')
    const toggle = restaurantDocument.querySelector<HTMLButtonElement>('[data-nav-toggle]')
    toggle?.click()
    expect(restaurantDocument.querySelector('[data-nav]')?.classList.contains('is-open')).toBe(true)
    const carta = restaurantDocument.querySelector<HTMLAnchorElement>('a[href="#carta"]')
    const click = new restaurantDom.window.MouseEvent('click', { bubbles: true, cancelable: true })
    carta?.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true)
    expect(restaurantDocument.querySelector('[data-nav]')?.classList.contains('is-open')).toBe(false)
    expect(restaurant).toContain('preview-anchors')
    const exported = packageSite('restaurante', getTemplate('restaurante').createContent())
    expect(exported.js).not.toContain('preview-anchors')
    const form = restaurantDocument.querySelector<HTMLFormElement>('form[data-site-form]')
    expect(form).toBeTruthy()
    restaurantDocument.querySelector<HTMLInputElement>('#campo-nombre')!.value = 'Ana'
    restaurantDocument.querySelector<HTMLInputElement>('#campo-telefono')!.value = '600'
    restaurantDocument.querySelector<HTMLInputElement>('#campo-fecha')!.value = '2026-12-01'
    form!.dispatchEvent(new restaurantDom.window.Event('submit', { bubbles: true, cancelable: true }))
    expect(restaurantDocument.querySelector('[data-form-status]')?.textContent).toContain('No se ha enviado')

    const reform = previewDocument('reformas', getTemplate('reformas').createContent())
    const reformDom = new JSDOM(reform, { runScripts: 'dangerously', pretendToBeVisual: true })
    const range = reformDom.window.document.querySelector<HTMLInputElement>('#comparador')
    expect(range).toBeTruthy()
    range!.value = '30'
    range!.dispatchEvent(new reformDom.window.Event('input', { bubbles: true }))
    expect(reformDom.window.document.querySelector<HTMLElement>('[data-after]')?.style.width).toBe('30%')
  })
})

describe('estudio', () => {
  it('guarda, recupera, duplica y bloquea la entrega sin calidad', () => {
    const storage = memory()
    const store = createStudioStore({ storage, now: () => '2026-11-25T10:00:00.000Z', id: () => 'id1' })
    expect(store.getState().projects).toHaveLength(3)
    const original = store.getState().projects[0]
    expect(store.setStatus(original.id, 'preparado_entrega').ok).toBe(false)
    const packed = packageSite(original.templateId, original.content)
    const report = runQa({
      projectId: original.id,
      content: original.content,
      html: packed.html,
      css: packed.css,
      js: packed.js,
      files: packed.files,
      contentRevision: original.contentRevision,
    })
    store.recordQa(original.id, report)
    expect(store.setStatus(original.id, 'preparado_entrega').ok).toBe(true)
    store.updateContent(original.id, original.content, 'Cambio de prueba')
    const updated = store.getState().projects.find((project) => project.id === original.id)!
    expect(store.setStatus(updated.id, 'entregado').ok).toBe(false)
    const copy = store.duplicateProject(original.id)
    expect(copy?.id).not.toBe(original.id)
    expect(copy?.content.brandName).toBe(original.content.brandName)
    expect(copy?.qa).toBeNull()
    store.flush()
    const restored = createStudioStore({ storage, now: () => '2026-11-25T11:00:00.000Z', id: () => 'id2' })
    expect(restored.getState().projects.some((project) => project.id === copy?.id)).toBe(true)
    const summary = productionSummary(restored.getState().projects)
    expect(summary.total).toBe(4)
    expect(summary.ready).toBe(1)
  })

  it('no borra una copia ilegible', () => {
    const storage = memory('{rota')
    const store = createStudioStore({ storage })
    expect(store.getState().corrupt).toBe(true)
    expect(storage.getItem(STORAGE_KEY)).toBe('{rota')
  })

  it('el panel suma incidencias y proyectos de las demostraciones', () => {
    const store = createStudioStore({ storage: memory() })
    const summary = productionSummary(store.getState().projects)
    expect(summary.inProduction).toBe(1)
    expect(summary.inReview).toBe(1)
    expect(summary.pendingApproval).toBe(1)
    expect(summary.openIncidents).toHaveLength(1)
    expect(summary.measuredMs).toBe(0)
  })
})

describe('arranque', () => {
  it('el script de Windows existe y arranca el servidor local', () => {
    const script = readFileSync('iniciar.bat', 'utf8')
    expect(script).toContain('npm run dev')
    expect(script).toContain('localhost:5173')
  })
})
