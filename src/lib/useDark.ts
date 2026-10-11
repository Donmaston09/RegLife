import { useEffect, useState } from 'react'

export function useDark() {
  const q = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && !!q?.matches))
  useEffect(() => {
    const upd = () => { const t = document.documentElement.dataset.theme; setDark(t === 'dark' || (!t && !!q?.matches)) }
    q?.addEventListener('change', upd)
    const mo = new MutationObserver(upd); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { q?.removeEventListener('change', upd); mo.disconnect() }
  }, [q])
  return dark
}
