import { IDEARK_SYSTEMS } from '../../contracts/ideark'
import { useTitle } from '../useTitle'

export function IntegrationsPage() {
  useTitle('Integraciones')
  return (
    <div className="page narrow">
      <p className="eyebrow">Contratos preparados</p>
      <h1 className="title">Ideark, sin conectar</h1>
      <p className="lead">Studio produce. No duplica clientes, catálogo ni contabilidad. Los identificadores se pueden reservar en cada proyecto, pero ninguna llamada sale de este ordenador.</p>
      <div className="library">
        {IDEARK_SYSTEMS.map((system) => (
          <article key={system.id}>
            <h2>{system.label}</h2>
            <p>{system.responsibility}</p>
            <p className="code">{system.system}</p>
            <p>Estado: no conectado. Falta el contrato oficial.</p>
          </article>
        ))}
      </div>
      <p className="footnote">ComeCerca tampoco está conectado. La plantilla de restaurante solo deja el hueco preparado.</p>
    </div>
  )
}

export function NotFoundPage() {
  useTitle('No encontrado')
  return (
    <div className="page">
      <h1 className="title">Esta página no está</h1>
      <p className="lead">El enlace no corresponde a una pantalla de Studio.</p>
    </div>
  )
}
