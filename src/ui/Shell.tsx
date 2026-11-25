import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { downloadBlob } from '../site/zip'
import { useStudio } from '../studio/Studio'
import { Mark, Notice, useConfirm } from './kit'

const LINKS = [
  ['/', 'Panel'],
  ['/proyectos', 'Proyectos'],
  ['/galeria', 'Galería'],
  ['/activos', 'Activos'],
  ['/calidad', 'Calidad'],
  ['/productividad', 'Productividad'],
] as const

export function Shell() {
  const { ready, corrupt, corruptRaw, persistError, theme, projects, api } = useStudio()
  const [open, setOpen] = useState(false)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const { confirm, dialog } = useConfirm()

  useEffect(() => setOpen(false), [location.pathname])

  if (!ready) return <div className="boot">Abriendo la fábrica…</div>
  if (corrupt) {
    return (
      <div className="error-screen">
        <Mark />
        <h1>No se puede leer la copia local</h1>
        <p>Los datos guardados en este navegador no tienen el formato de Ideark Studio 1.0. No se han borrado.</p>
        <div className="row-actions">
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([corruptRaw ?? ''], { type: 'application/json' })
              downloadBlob(blob, 'ideark-studio-copia-ilegible.json')
            }}
          >
            Descargar la copia ilegible
          </button>
          <button type="button" className="primary" onClick={() => api.resetAndSeed()}>
            Empezar con las demostraciones
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <NavLink to="/" className="brand">
          <Mark />
          <span>
            <strong>Ideark</strong>
            <em>Studio</em>
          </span>
        </NavLink>
        <nav className="side-nav" aria-label="Módulos">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'side-link is-active' : 'side-link')}>
              {label}
              {to === '/proyectos' ? <em>{projects.length}</em> : null}
            </NavLink>
          ))}
          <NavLink to="/integraciones" className={({ isActive }) => (isActive ? 'side-link is-active' : 'side-link')}>
            Integraciones
          </NavLink>
        </nav>
        <div className="future">
          <p>Más adelante</p>
          <span className="locked">Studio AI</span>
          <span className="locked">Automatizaciones</span>
          <span className="locked">Aplicaciones</span>
          <span className="locked">Care</span>
          <small>No están disponibles en esta versión.</small>
        </div>
        <div className="side-foot">
          <button type="button" onClick={() => api.setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([api.exportState()], { type: 'application/json' })
              downloadBlob(blob, 'ideark-studio-copia.json')
              setBackupMessage('Copia descargada.')
            }}
          >
            Descargar copia
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Restaurar copia
          </button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              const ok = await confirm('Se sustituirán los proyectos de este navegador por los de la copia elegida.', 'Restaurar')
              if (!ok) return
              const text = await file.text()
              const result = api.importState(text)
              setBackupMessage(result.ok ? 'Copia restaurada.' : result.reason)
            }}
          />
          <button
            type="button"
            onClick={() => {
              const added = api.restoreDemos()
              setBackupMessage(added ? 'Demostraciones recuperadas.' : 'Las tres demostraciones ya estaban.')
            }}
          >
            Recuperar demostraciones
          </button>
          {backupMessage ? <small>{backupMessage}</small> : null}
        </div>
      </aside>
      {open ? <button type="button" className="backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} /> : null}
      <div className="main">
        <header className="topbar">
          <button type="button" className="menu-button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            Menú
          </button>
          <p>Fábrica digital local · los proyectos quedan en este navegador</p>
        </header>
        {persistError ? <Notice tone="bad">{persistError}</Notice> : null}
        <div id="contenido">
          <Outlet />
        </div>
      </div>
      {dialog}
    </div>
  )
}
