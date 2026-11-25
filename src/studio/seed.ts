import { getTemplate } from '../site/registry'
import { emptyExternal, emptyTime, type Project } from './types'

function demo(project: Omit<Project, 'product' | 'content' | 'contentRevision' | 'qa' | 'exports' | 'time' | 'estimateMinutes' | 'external' | 'demo'> & { templateId: string }): Project {
  return {
    ...project,
    product: 'web',
    content: getTemplate(project.templateId).createContent(),
    contentRevision: 1,
    qa: null,
    exports: [],
    time: emptyTime(),
    estimateMinutes: null,
    external: emptyExternal(),
    demo: true,
  }
}

export function createDemoProjects(): Project[] {
  return [
    demo({
      id: 'prj_demo_restaurante',
      code: 'WEB-1001',
      name: 'Mar de Olivos',
      client: 'Hostelería Olivos (demostración)',
      sector: 'Restauración',
      templateId: 'restaurante',
      owner: 'Laura Campos',
      status: 'en_produccion',
      createdAt: '2026-11-18T09:30:00.000Z',
      dueDate: '2026-12-04',
      updatedAt: '2026-11-22T16:10:00.000Z',
      history: [
        { id: 'hist_r1', at: '2026-11-18T09:30:00.000Z', message: 'Proyecto de demostración creado con la plantilla Restaurante.' },
        { id: 'hist_r2', at: '2026-11-20T11:00:00.000Z', message: 'Estado: Nuevo → En producción.' },
      ],
      incidents: [],
    }),
    demo({
      id: 'prj_demo_reformas',
      code: 'WEB-1002',
      name: 'Obradores del Turia',
      client: 'Obradores del Turia (demostración)',
      sector: 'Reformas y obra',
      templateId: 'reformas',
      owner: 'Andrés Molina',
      status: 'revision_interna',
      createdAt: '2026-11-12T08:15:00.000Z',
      dueDate: '2026-12-12',
      updatedAt: '2026-11-23T09:40:00.000Z',
      history: [
        { id: 'hist_o1', at: '2026-11-12T08:15:00.000Z', message: 'Proyecto de demostración creado con la plantilla Reformas.' },
        { id: 'hist_o2', at: '2026-11-19T12:20:00.000Z', message: 'Estado: En producción → Revisión interna.' },
        { id: 'hist_o3', at: '2026-11-21T10:00:00.000Z', message: 'Incidencia abierta: Confirmar el teléfono de la obra.' },
      ],
      incidents: [
        {
          id: 'inc_demo_reformas',
          title: 'Confirmar el teléfono de la obra',
          detail: 'Incidencia de demostración. El teléfono del proyecto sigue siendo ficticio.',
          severity: 'media',
          status: 'abierta',
          createdAt: '2026-11-21T10:00:00.000Z',
          resolvedAt: null,
        },
      ],
    }),
    demo({
      id: 'prj_demo_clinica',
      code: 'WEB-1003',
      name: 'Clínica Alba Norte',
      client: 'Clínica Alba Norte (demostración)',
      sector: 'Salud',
      templateId: 'clinica',
      owner: 'Nuria Vidal',
      status: 'pendiente_aprobacion',
      createdAt: '2026-11-20T10:00:00.000Z',
      dueDate: '2027-01-15',
      updatedAt: '2026-11-24T18:05:00.000Z',
      history: [
        { id: 'hist_c1', at: '2026-11-20T10:00:00.000Z', message: 'Proyecto de demostración creado con la plantilla Clínica.' },
        { id: 'hist_c2', at: '2026-11-22T09:10:00.000Z', message: 'Incidencia resuelta: Revisar el texto de la cita.' },
        { id: 'hist_c3', at: '2026-11-24T18:05:00.000Z', message: 'Estado: Revisión interna → Pendiente de aprobación.' },
      ],
      incidents: [
        {
          id: 'inc_demo_clinica',
          title: 'Revisar el texto de la cita',
          detail: 'Incidencia de demostración, ya resuelta. El formulario avisa de que no recoge historia clínica.',
          severity: 'baja',
          status: 'resuelta',
          createdAt: '2026-11-21T15:00:00.000Z',
          resolvedAt: '2026-11-22T09:10:00.000Z',
        },
      ],
    }),
  ]
}
