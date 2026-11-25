import { useCallback, useState, type ReactNode } from 'react'
import { statusLabel, type ProjectStatus } from '../studio/types'

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 7h14l8 8v10H5V7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 7v8h8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function Stamp() {
  return <span className="stamp">Demostración</span>
}

export function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`pill pill-${status}`}>{statusLabel(status)}</span>
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function useConfirm() {
  const [pending, setPending] = useState<null | { message: string; confirmLabel: string; resolve: (value: boolean) => void }>(null)
  const confirm = useCallback((message: string, confirmLabel = 'Continuar') => {
    return new Promise<boolean>((resolve) => setPending({ message, confirmLabel, resolve }))
  }, [])
  const dialog = pending ? (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-modal="true">
        <p>{pending.message}</p>
        <div className="row-actions">
          <button
            type="button"
            onClick={() => {
              pending.resolve(false)
              setPending(null)
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              pending.resolve(true)
              setPending(null)
            }}
          >
            {pending.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null
  return { confirm, dialog }
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'bad'; children: ReactNode }) {
  return <p className={`notice notice-${tone}`}>{children}</p>
}
