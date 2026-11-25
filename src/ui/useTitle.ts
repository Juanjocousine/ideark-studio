import { useEffect } from 'react'

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Ideark Studio`
  }, [title])
}
