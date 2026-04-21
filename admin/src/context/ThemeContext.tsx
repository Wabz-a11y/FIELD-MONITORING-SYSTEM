import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Theme } from '../types'

interface Ctx { theme: Theme; resolved: 'light'|'dark'; setTheme: (t: Theme) => void }
const ThemeCtx = createContext<Ctx|null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('ss_theme') as Theme) || 'system')

  const resolve = (t: Theme): 'light'|'dark' =>
    t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t

  const [resolved, setResolved] = useState<'light'|'dark'>(() => resolve(theme))

  const apply = (t: Theme) => {
    const r = resolve(t)
    setResolved(r)
    document.documentElement.setAttribute('data-theme', r)
  }

  useEffect(() => { apply(theme) }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => { if (theme === 'system') apply('system') }
    mq.addEventListener('change', h); return () => mq.removeEventListener('change', h)
  }, [theme])

  const setTheme = (t: Theme) => { localStorage.setItem('ss_theme', t); setThemeState(t) }
  return <ThemeCtx.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => { const c = useContext(ThemeCtx); if (!c) throw new Error(''); return c }
