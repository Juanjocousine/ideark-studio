import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { createStudioStore, type StudioStore } from './store'
import type { TimeBucket } from './types'

const StudioContext = createContext<StudioStore | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => createStudioStore({ storage: window.localStorage }), [])
  const theme = useSyncExternalStore(store.subscribe, () => store.getState().theme, () => store.getState().theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const flush = () => store.flush()
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [store])
  return <StudioContext.Provider value={store}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const store = useContext(StudioContext)
  if (!store) throw new Error('Falta el proveedor de Studio')
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
  return { ...state, api: store }
}

export function useMeasuredTime(projectId: string | undefined, bucket: TimeBucket) {
  const { api } = useStudio()
  useEffect(() => {
    if (!projectId) return
    let last = performance.now()
    const flush = () => {
      const time = performance.now()
      const delta = time - last
      last = time
      if (delta >= 200) api.addTime(projectId, bucket, delta)
    }
    const onHide = () => {
      if (document.hidden) flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', flush)
    const timer = window.setInterval(flush, 15000)
    return () => {
      flush()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', flush)
    }
  }, [api, bucket, projectId])
}
